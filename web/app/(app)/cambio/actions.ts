"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parsearMonto } from "@/lib/finanzas/montos";
import type { TipoOperacion, Moneda } from "@/lib/cambio/tipos";

// Las mismas uniones de tipos.ts, como array para poder validar un valor de
// FormData en runtime. Si tipos.ts cambia, este array se actualiza a mano:
// TypeScript no deriva un array de miembros desde una unión de literals.
const TIPOS: TipoOperacion[] = ["compra", "venta", "carga"];
const MONEDAS: Moneda[] = ["ARS", "USD"];

function esTipoValido(v: string): v is TipoOperacion {
  return (TIPOS as string[]).includes(v);
}

function esMonedaValida(v: string): v is Moneda {
  return (MONEDAS as string[]).includes(v);
}

/**
 * Los costos son opcionales y CERO es un valor legítimo: la mayoría de las
 * operaciones no tienen comisión. `parsearMonto` rechaza el cero a propósito
 * (un gasto de $0 no es un gasto), así que acá el caso se resuelve antes de
 * delegarle — si no, escribir "0" en el campo daba error de validación.
 */
function parsearCostos(texto: string): number | null {
  const s = texto.trim();
  if (s === "") return 0;
  if (/^0+([.,]0+)?$/.test(s)) return 0;
  return parsearMonto(s);
}

export type ResultadoAlta = { ok: true } | { ok: false; error: string };

type CamposOperacion = {
  op_date: string;
  kind: TipoOperacion;
  client_id: string | null;
  sender: string;
  receiver: string;
  amount: number;
  amount_currency: Moneda;
  rate: number;
  ars_account_id: string | null;
  usd_account_id: string | null;
  fees: number;
  notes: string;
  comprobante_path: string;
};

type ResultadoCampos = { ok: true; valores: CamposOperacion } | { ok: false; error: string };

/**
 * Parsea y arma los campos de una operación de cambio a partir del FormData:
 * la misma lógica que usan tanto el alta como la edición, para que una
 * operación editada quede sujeta exactamente a las mismas reglas que una
 * creada de cero. Devuelve el error de validación en vez de tirar, para que
 * el llamador decida antes de tocar la base.
 */
function camposDeOperacion(formData: FormData): ResultadoCampos {
  const opDate = String(formData.get("opDate") ?? "").trim();
  if (!opDate) return { ok: false, error: "Falta la fecha." };

  // Un <select> nunca manda algo fuera de estos sets, pero un server action
  // recibe FormData arbitrario: se valida contra la misma fuente de verdad
  // que usa la lectura en vez de confiar en el origen del pedido.
  const kind = String(formData.get("kind") ?? "");
  if (!esTipoValido(kind)) return { ok: false, error: "El tipo de operación no es válido." };

  const amountCurrency = String(formData.get("amountCurrency") ?? "");
  if (!esMonedaValida(amountCurrency)) return { ok: false, error: "La moneda del monto no es válida." };

  const amount = parsearMonto(String(formData.get("amount") ?? ""));
  if (amount === null) {
    return {
      ok: false,
      error: "El monto no es válido. Escribilo a la argentina, con coma decimal (ej: 452.500,50).",
    };
  }

  // Un TC en cero o negativo haría dividir por cero al derivar los dólares, y
  // dejaría la operación neutra en todos los totales sin decir por qué.
  const rate = parsearMonto(String(formData.get("rate") ?? ""));
  if (rate === null) {
    return { ok: false, error: "El tipo de cambio no es válido. Tiene que ser un número mayor a cero." };
  }

  const fees = parsearCostos(String(formData.get("fees") ?? ""));
  if (fees === null) return { ok: false, error: "Los costos no son un monto válido." };

  return {
    ok: true,
    valores: {
      op_date: opDate,
      kind,
      client_id: String(formData.get("clientId") ?? "") || null,
      sender: String(formData.get("sender") ?? "").trim(),
      receiver: String(formData.get("receiver") ?? "").trim(),
      // Se guarda UN solo importe. Los USD y los pesos se derivan en
      // lib/cambio/calculo.ts: guardar los tres permitiría estados que se
      // contradicen entre sí.
      amount,
      amount_currency: amountCurrency,
      rate,
      ars_account_id: String(formData.get("arsAccountId") ?? "") || null,
      usd_account_id: String(formData.get("usdAccountId") ?? "") || null,
      fees,
      notes: String(formData.get("notes") ?? "").trim(),
      comprobante_path: String(formData.get("comprobantePath") ?? "").trim(),
    },
  };
}

export async function createExchangeOp(formData: FormData): Promise<ResultadoAlta> {
  const campos = camposDeOperacion(formData);
  if (!campos.ok) return campos;

  try {
    const sb = await createClient();

    // .limit(1) antes de .single() es lo que evita que .single() explote con
    // "more than one row" si algún día hay dos empresas que matchean el
    // ilike. Pero eso deja un riesgo latente sin resolver: sin ORDER BY, cuál
    // de las dos se elige queda a criterio de Postgres, en silencio y sin
    // error. Documentado a propósito, no se cambia el comportamiento acá.
    const { data: empresa, error: errEmpresa } = await sb
      .from("companies")
      .select("id")
      .ilike("name", "%gestiones%ma%")
      .limit(1)
      .single();

    if (errEmpresa) {
      // Con RLS activo, un problema de permisos se ve igual que "no hay
      // datos": sin loguear el error acá, un timeout o una política mal
      // configurada se confunde con que la empresa no existe.
      console.error("[cambio] búsqueda de empresa falló:", errEmpresa.message, errEmpresa.details ?? "");
      return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };
    }

    if (!empresa) {
      console.error("[cambio] no se encontró la empresa GESTIONES MA en companies");
      return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };
    }

    const { error } = await sb.from("exchange_ops").insert({
      company_id: empresa.id,
      ...campos.valores,
    });

    // Una inserción que falla en silencio se ve, desde el modal, igual que
    // una que funcionó: el usuario cierra el form creyendo que quedó.
    if (error) {
      console.error("[cambio] alta de operación falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la operación. Probá de nuevo." };
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[cambio] alta de operación falló:", err.message);
    return { ok: false, error: "No se pudo guardar la operación. Probá de nuevo." };
  }

  // El insert ya commiteó. revalidatePath es best-effort y va en su propio
  // try/catch: reportar como fallida un alta que ya ocurrió hace que el
  // usuario la vuelva a cargar y duplique la operación.
  try {
    revalidatePath("/cambio");
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[cambio] la operación se guardó pero revalidatePath falló:", err.message);
  }

  return { ok: true };
}

export async function setComprobante(opId: string, path: string): Promise<ResultadoAlta> {
  if (!opId) return { ok: false, error: "Falta la operación." };
  try {
    const sb = await createClient();
    const { error } = await sb.from("exchange_ops").update({ comprobante_path: path }).eq("id", opId);
    if (error) {
      console.error("[cambio] set comprobante falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar el comprobante. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] set comprobante falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar el comprobante. Probá de nuevo." };
  }
  try {
    revalidatePath("/cambio");
  } catch (e) {
    console.error("[cambio] set comprobante ok pero revalidatePath falló:", e instanceof Error ? e.message : String(e));
  }
  return { ok: true };
}

export async function updateExchangeOp(opId: string, formData: FormData): Promise<ResultadoAlta> {
  if (!opId) return { ok: false, error: "Falta la operación." };

  // Los mismos campos y las mismas reglas que el alta: se valida antes de
  // tocar la base, para que un formulario mal completado no pise una
  // operación existente con datos a medias.
  const campos = camposDeOperacion(formData);
  if (!campos.ok) return campos;

  try {
    const sb = await createClient();
    const { error } = await sb.from("exchange_ops").update(campos.valores).eq("id", opId);

    if (error) {
      console.error("[cambio] edición de operación falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la operación. Probá de nuevo." };
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[cambio] edición de operación falló:", err.message);
    return { ok: false, error: "No se pudo guardar la operación. Probá de nuevo." };
  }

  // El update ya commiteó. revalidatePath es best-effort y va en su propio
  // try/catch: reportar como fallida una edición que ya ocurrió confunde al
  // usuario sobre si el cambio quedó guardado o no.
  try {
    revalidatePath("/cambio");
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[cambio] la operación se editó pero revalidatePath falló:", err.message);
  }

  return { ok: true };
}

export async function deleteExchangeOp(opId: string): Promise<ResultadoAlta> {
  if (!opId) return { ok: false, error: "Falta la operación." };

  try {
    const sb = await createClient();
    const { error } = await sb.from("exchange_ops").delete().eq("id", opId);

    if (error) {
      console.error("[cambio] eliminación de operación falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo eliminar la operación. Probá de nuevo." };
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[cambio] eliminación de operación falló:", err.message);
    return { ok: false, error: "No se pudo eliminar la operación. Probá de nuevo." };
  }

  // El delete ya commiteó. revalidatePath es best-effort y va en su propio
  // try/catch: reportar como fallida una eliminación que ya ocurrió confunde
  // al usuario sobre si la operación sigue existiendo o no.
  try {
    revalidatePath("/cambio");
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[cambio] la operación se eliminó pero revalidatePath falló:", err.message);
  }

  return { ok: true };
}
