"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parsearMonto } from "@/lib/finanzas/montos";
import type { Moneda } from "@/lib/cambio/tipos";
import type { TipoGestion } from "@/lib/cambio/runners";

const MONEDAS: Moneda[] = ["ARS", "USD"];
const TIPOS_GESTION: TipoGestion[] = ["retiro", "transferencia"];

function esMonedaValida(v: string): v is Moneda {
  return (MONEDAS as string[]).includes(v);
}

function esTipoGestionValido(v: string): v is TipoGestion {
  return (TIPOS_GESTION as string[]).includes(v);
}

/**
 * Vacío o "0" son un valor legítimo para un monto opcional: el monto
 * informativo de una gestión (el pago real está en `fee`), y el propio `fee`
 * cuando la cuenta o la gestión no tuvieron comisión. `parsearMonto` rechaza
 * el cero a propósito, así que acá el caso se resuelve antes de delegarle.
 * Mismo criterio que `parsearCostos` en actions.ts.
 */
function parsearMontoOpcional(texto: string): number | null {
  const s = texto.trim();
  if (s === "") return 0;
  if (/^0+([.,]0+)?$/.test(s)) return 0;
  return parsearMonto(s);
}

export type ResultadoAlta = { ok: true } | { ok: false; error: string };

/**
 * company_id de GESTIONES MA, resuelto por nombre. Mismo mecanismo que
 * `createExchangeOp` en actions.ts: `.limit(1)` antes de `.single()` evita que
 * `.single()` explote si algún día hay dos empresas que matchean el ilike (a
 * costa de dejar sin resolver, a propósito, cuál de las dos gana sin ORDER BY).
 */
async function empresaId(sb: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data, error } = await sb
    .from("companies")
    .select("id")
    .ilike("name", "%gestiones%ma%")
    .limit(1)
    .single();

  if (error) {
    // Con RLS activo, un problema de permisos se ve igual que "no hay datos":
    // sin loguear el error acá, un timeout o una política mal configurada se
    // confunde con que la empresa no existe.
    console.error("[cambio] búsqueda de empresa falló:", error.message, error.details ?? "");
    return null;
  }
  if (!data) {
    console.error("[cambio] no se encontró la empresa GESTIONES MA en companies");
    return null;
  }
  return data.id as string;
}

function revalidateRunners(mensaje: string): void {
  // La escritura ya commiteó. revalidatePath es best-effort y va en su propio
  // try/catch: reportar como fallida una operación que ya ocurrió hace que el
  // usuario la vuelva a intentar y duplique o repita la operación.
  try {
    revalidatePath("/cambio/runners");
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error(`[cambio] ${mensaje} pero revalidatePath falló:`, err.message);
  }
}

export async function createRunner(formData: FormData): Promise<ResultadoAlta> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Falta el nombre." };

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    const { error } = await sb.from("runners").insert({ company_id: cid, name });
    if (error) {
      console.error("[cambio] alta de runner falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar el runner. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] alta de runner falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar el runner. Probá de nuevo." };
  }

  revalidateRunners("el runner se guardó");
  return { ok: true };
}

export async function createRunnerAccount(formData: FormData): Promise<ResultadoAlta> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Falta el nombre." };

  const currency = String(formData.get("currency") ?? "");
  if (!esMonedaValida(currency)) return { ok: false, error: "La moneda no es válida." };

  const fee = parsearMontoOpcional(String(formData.get("fee") ?? ""));
  if (fee === null) {
    return {
      ok: false,
      error: "El pago no es un monto válido. Escribilo a la argentina, con coma decimal (ej: 1.500,50).",
    };
  }

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    const { error } = await sb.from("runner_accounts").insert({ company_id: cid, name, currency, fee });
    if (error) {
      console.error("[cambio] alta de cuenta de gestión falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] alta de cuenta de gestión falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." };
  }

  revalidateRunners("la cuenta se guardó");
  return { ok: true };
}

type CamposGestion = {
  gestion_date: string;
  runner_id: string;
  account_id: string;
  kind: TipoGestion;
  amount: number;
  fee: number;
  notes: string;
};

type ResultadoCamposGestion = { ok: true; valores: CamposGestion } | { ok: false; error: string };

/**
 * Parsea y arma los campos de una gestión de runner a partir del FormData: la
 * misma lógica que usan tanto el alta como la edición, para que una gestión
 * editada quede sujeta exactamente a las mismas reglas que una creada de
 * cero. Devuelve el error de validación en vez de tirar, para que el
 * llamador decida antes de tocar la base.
 */
function camposDeGestion(formData: FormData): ResultadoCamposGestion {
  const gestionDate = String(formData.get("gestionDate") ?? "").trim();
  if (!gestionDate) return { ok: false, error: "Falta la fecha." };

  const runnerId = String(formData.get("runnerId") ?? "").trim();
  if (!runnerId) return { ok: false, error: "Falta el runner." };

  const accountId = String(formData.get("accountId") ?? "").trim();
  if (!accountId) return { ok: false, error: "Falta la cuenta." };

  const kind = String(formData.get("kind") ?? "");
  if (!esTipoGestionValido(kind)) return { ok: false, error: "El tipo de gestión no es válido." };

  const amount = parsearMontoOpcional(String(formData.get("amount") ?? ""));
  if (amount === null) return { ok: false, error: "El monto no es un valor válido." };

  const fee = parsearMontoOpcional(String(formData.get("fee") ?? ""));
  if (fee === null) {
    return {
      ok: false,
      error: "El pago no es un monto válido. Escribilo a la argentina, con coma decimal (ej: 1.500,50).",
    };
  }

  return {
    ok: true,
    valores: {
      gestion_date: gestionDate,
      runner_id: runnerId,
      account_id: accountId,
      kind,
      amount,
      fee,
      notes: String(formData.get("notes") ?? "").trim(),
    },
  };
}

export async function createRunnerGestion(formData: FormData): Promise<ResultadoAlta> {
  const campos = camposDeGestion(formData);
  if (!campos.ok) return campos;

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    const { error } = await sb.from("runner_gestiones").insert({ company_id: cid, ...campos.valores });
    if (error) {
      console.error("[cambio] alta de gestión falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la gestión. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] alta de gestión falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar la gestión. Probá de nuevo." };
  }

  revalidateRunners("la gestión se guardó");
  return { ok: true };
}

export async function updateRunnerGestion(id: string, formData: FormData): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta la gestión." };

  // Los mismos campos y las mismas reglas que el alta: se valida antes de
  // tocar la base, para que un formulario mal completado no pise una
  // gestión existente con datos a medias.
  const campos = camposDeGestion(formData);
  if (!campos.ok) return campos;

  try {
    const sb = await createClient();
    const { error } = await sb.from("runner_gestiones").update(campos.valores).eq("id", id);
    if (error) {
      console.error("[cambio] edición de gestión falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la gestión. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] edición de gestión falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar la gestión. Probá de nuevo." };
  }

  revalidateRunners("la gestión se editó");
  return { ok: true };
}

export async function deleteRunnerGestion(id: string): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta la gestión." };

  try {
    const sb = await createClient();
    const { error } = await sb.from("runner_gestiones").delete().eq("id", id);
    if (error) {
      console.error("[cambio] eliminación de gestión falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo eliminar la gestión. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] eliminación de gestión falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo eliminar la gestión. Probá de nuevo." };
  }

  revalidateRunners("la gestión se eliminó");
  return { ok: true };
}

type CamposPago = {
  payment_date: string;
  runner_id: string;
  amount: number;
  notes: string;
};

type ResultadoCamposPago = { ok: true; valores: CamposPago } | { ok: false; error: string };

/**
 * Parsea y arma los campos de un pago a runner a partir del FormData: la
 * misma lógica que usan tanto el alta como la edición. A diferencia de `fee`
 * en una gestión, acá el monto es la razón de ser del pago: `parsearMonto`
 * rechaza el cero a propósito y ese rechazo se propaga tal cual.
 */
function camposDePago(formData: FormData): ResultadoCamposPago {
  const paymentDate = String(formData.get("paymentDate") ?? "").trim();
  if (!paymentDate) return { ok: false, error: "Falta la fecha." };

  const runnerId = String(formData.get("runnerId") ?? "").trim();
  if (!runnerId) return { ok: false, error: "Falta el runner." };

  const amount = parsearMonto(String(formData.get("amount") ?? ""));
  if (amount === null) {
    return {
      ok: false,
      error: "El monto no es válido. Escribilo a la argentina, con coma decimal (ej: 452.500,50).",
    };
  }

  return {
    ok: true,
    valores: {
      payment_date: paymentDate,
      runner_id: runnerId,
      amount,
      notes: String(formData.get("notes") ?? "").trim(),
    },
  };
}

export async function createRunnerPayment(formData: FormData): Promise<ResultadoAlta> {
  const campos = camposDePago(formData);
  if (!campos.ok) return campos;

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    const { error } = await sb.from("runner_payments").insert({ company_id: cid, ...campos.valores });
    if (error) {
      console.error("[cambio] alta de pago a runner falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar el pago. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] alta de pago a runner falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar el pago. Probá de nuevo." };
  }

  revalidateRunners("el pago se guardó");
  return { ok: true };
}

export async function updateRunnerPayment(id: string, formData: FormData): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta el pago." };

  // Los mismos campos y las mismas reglas que el alta: se valida antes de
  // tocar la base, para que un formulario mal completado no pise un pago
  // existente con datos a medias.
  const campos = camposDePago(formData);
  if (!campos.ok) return campos;

  try {
    const sb = await createClient();
    const { error } = await sb.from("runner_payments").update(campos.valores).eq("id", id);
    if (error) {
      console.error("[cambio] edición de pago a runner falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar el pago. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] edición de pago a runner falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar el pago. Probá de nuevo." };
  }

  revalidateRunners("el pago se editó");
  return { ok: true };
}

export async function deleteRunnerPayment(id: string): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta el pago." };

  try {
    const sb = await createClient();
    const { error } = await sb.from("runner_payments").delete().eq("id", id);
    if (error) {
      console.error("[cambio] eliminación de pago a runner falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo eliminar el pago. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] eliminación de pago a runner falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo eliminar el pago. Probá de nuevo." };
  }

  revalidateRunners("el pago se eliminó");
  return { ok: true };
}
