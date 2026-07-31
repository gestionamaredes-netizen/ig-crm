"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ResultadoAlta = { ok: true } | { ok: false; error: string };

/**
 * company_id de GESTIONES MA, resuelto por nombre. Mismo mecanismo que
 * `empresaId` en runners-actions.ts: `.limit(1)` antes de `.single()` evita
 * que `.single()` explote si algún día hay dos empresas que matchean el
 * ilike (a costa de dejar sin resolver, a propósito, cuál de las dos gana
 * sin ORDER BY).
 *
 * `companies` queda con RLS `using(true)` (legible por cualquier
 * authenticated) a proposito: el alta de cuenta operativa desde /panel la
 * hace un runner, y esta funcion depende de poder resolverla. Si algun dia
 * se cierra `companies`, este lookup se rompe en silencio para los runners.
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

function revalidateCelulares(mensaje: string): void {
  // La escritura ya commiteó. revalidatePath es best-effort y va en su propio
  // try/catch: reportar como fallida una operación que ya ocurrió hace que el
  // usuario la vuelva a intentar y duplique o repita la operación.
  try {
    revalidatePath("/cambio/celulares");
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error(`[cambio] ${mensaje} pero revalidatePath falló:`, err.message);
  }
}

/**
 * Como `revalidateCelulares`, pero además revalida /panel: las cuentas
 * operativas (a diferencia de los celulares) también se dan de alta y se
 * editan desde ahí, y el runner que lo hace vería datos viejos hasta
 * recargar si no se revalida esa ruta.
 */
function revalidateCuentaOperativa(mensaje: string): void {
  try {
    revalidatePath("/cambio/celulares");
    revalidatePath("/panel");
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error(`[cambio] ${mensaje} pero revalidatePath falló:`, err.message);
  }
}

type CamposCelular = {
  alias: string;
  model: string;
  runner_id: string | null;
  active: boolean;
};

/**
 * Arma los campos de un celular a partir del FormData: la misma lógica que
 * usan tanto el alta como la edición. `runnerId` vacío es un valor legítimo
 * (celular sin runner a cargo todavía) y se guarda como null, no como error.
 * `active` sólo se toma como false si viene explícitamente "false"; si el
 * campo no está en el FormData, el celular nace operativo.
 */
function camposDeCelular(formData: FormData): CamposCelular {
  const runnerIdRaw = String(formData.get("runnerId") ?? "").trim();
  const activeRaw = formData.get("active");

  return {
    alias: String(formData.get("alias") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    runner_id: runnerIdRaw === "" ? null : runnerIdRaw,
    active: activeRaw === null ? true : String(activeRaw) !== "false",
  };
}

export async function createPhone(formData: FormData): Promise<ResultadoAlta> {
  const campos = camposDeCelular(formData);

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    const { error } = await sb.from("phones").insert({ company_id: cid, ...campos });
    if (error) {
      console.error("[cambio] alta de celular falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar el celular. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] alta de celular falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar el celular. Probá de nuevo." };
  }

  revalidateCelulares("el celular se guardó");
  return { ok: true };
}

export async function updatePhone(id: string, formData: FormData): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta el celular." };

  const campos = camposDeCelular(formData);

  try {
    const sb = await createClient();
    const { error } = await sb.from("phones").update(campos).eq("id", id);
    if (error) {
      console.error("[cambio] edición de celular falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar el celular. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] edición de celular falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar el celular. Probá de nuevo." };
  }

  revalidateCelulares("el celular se editó");
  return { ok: true };
}

export async function deletePhone(id: string): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta el celular." };

  try {
    const sb = await createClient();
    const { error } = await sb.from("phones").delete().eq("id", id);
    if (error) {
      console.error("[cambio] eliminación de celular falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo eliminar el celular. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] eliminación de celular falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo eliminar el celular. Probá de nuevo." };
  }

  revalidateCelulares("el celular se eliminó");
  return { ok: true };
}

type CamposCuenta = {
  phone_id: string;
  holder_name: string;
  dni: string;
  cbu_pesos: string;
  alias_pesos: string;
  cbu_dolares: string;
  alias_dolares: string;
  status: string;
  notes: string;
};

type ResultadoCamposCuenta = { ok: true; valores: CamposCuenta } | { ok: false; error: string };

/**
 * Parsea y arma los campos de una cuenta operativa a partir del FormData: la
 * misma lógica que usan tanto el alta como la edición, para que una cuenta
 * editada quede sujeta exactamente a las mismas reglas que una creada de
 * cero. `phoneId` es obligatorio (toda cuenta cuelga de un celular);
 * devuelve el error de validación en vez de tirar, para que el llamador
 * decida antes de tocar la base. `status` vacío cae al default 'activa'.
 */
function camposDeCuenta(formData: FormData): ResultadoCamposCuenta {
  const phoneId = String(formData.get("phoneId") ?? "").trim();
  if (!phoneId) return { ok: false, error: "Falta el celular." };

  const status = String(formData.get("status") ?? "").trim() || "activa";

  return {
    ok: true,
    valores: {
      phone_id: phoneId,
      holder_name: String(formData.get("holderName") ?? "").trim(),
      dni: String(formData.get("dni") ?? "").trim(),
      cbu_pesos: String(formData.get("cbuPesos") ?? "").trim(),
      alias_pesos: String(formData.get("aliasPesos") ?? "").trim(),
      cbu_dolares: String(formData.get("cbuDolares") ?? "").trim(),
      alias_dolares: String(formData.get("aliasDolares") ?? "").trim(),
      status,
      notes: String(formData.get("notes") ?? "").trim(),
    },
  };
}

export async function createPhoneAccount(formData: FormData): Promise<ResultadoAlta> {
  const campos = camposDeCuenta(formData);
  if (!campos.ok) return campos;

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    const { error } = await sb.from("phone_accounts").insert({ company_id: cid, ...campos.valores });
    if (error) {
      console.error("[cambio] alta de cuenta operativa falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] alta de cuenta operativa falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." };
  }

  revalidateCuentaOperativa("la cuenta se guardó");
  return { ok: true };
}

export async function updatePhoneAccount(id: string, formData: FormData): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta la cuenta." };

  // Los mismos campos y las mismas reglas que el alta: se valida antes de
  // tocar la base, para que un formulario mal completado no pise una cuenta
  // existente con datos a medias.
  const campos = camposDeCuenta(formData);
  if (!campos.ok) return campos;

  try {
    const sb = await createClient();
    const { error } = await sb.from("phone_accounts").update(campos.valores).eq("id", id);
    if (error) {
      console.error("[cambio] edición de cuenta operativa falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] edición de cuenta operativa falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." };
  }

  revalidateCuentaOperativa("la cuenta se editó");
  return { ok: true };
}

export async function deletePhoneAccount(id: string): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta la cuenta." };

  try {
    const sb = await createClient();
    const { error } = await sb.from("phone_accounts").delete().eq("id", id);
    if (error) {
      console.error("[cambio] eliminación de cuenta operativa falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo eliminar la cuenta. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] eliminación de cuenta operativa falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo eliminar la cuenta. Probá de nuevo." };
  }

  revalidateCuentaOperativa("la cuenta se eliminó");
  return { ok: true };
}
