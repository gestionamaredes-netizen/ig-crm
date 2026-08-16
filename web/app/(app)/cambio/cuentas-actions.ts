"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ResultadoAlta = { ok: true } | { ok: false; error: string };

/**
 * company_id de GESTIONES MA, resuelto por nombre. Mismo mecanismo que
 * `empresaId` en celulares-actions.ts: `.limit(1)` antes de `.single()` evita
 * que `.single()` explote si algún día hay dos empresas que matchean el
 * ilike (a costa de dejar sin resolver, a propósito, cuál de las dos gana
 * sin ORDER BY).
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

function revalidateCuentas(mensaje: string): void {
  // La escritura ya commiteó. revalidatePath es best-effort y va en su propio
  // try/catch: reportar como fallida una operación que ya ocurrió hace que el
  // usuario la vuelva a intentar y duplique o repita la operación.
  try {
    revalidatePath("/cambio/cuentas");
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error(`[cambio] ${mensaje} pero revalidatePath falló:`, err.message);
  }
}

type CamposCuenta = {
  titular: string;
  dni: string;
  banco: string;
  cbu_pesos: string;
  alias_pesos: string;
  cbu_dolares: string;
  alias_dolares: string;
  notes: string;
  tarjeta: boolean;
  runner_id: string | null;
  usuario: string;
  clave: string;
};

/**
 * Arma los campos de una cuenta a partir del FormData: la misma lógica que
 * usan tanto el alta como la edición. Los campos de texto se guardan
 * recortados. `tarjeta` (¿se maneja por tarjeta?) llega como "true"/"false"
 * desde un toggle controlado del formulario, igual que `active` en los
 * celulares; solo es true cuando viene explícitamente "true".
 */
function camposDeCuenta(formData: FormData): CamposCuenta {
  // `runnerId` vacío es legítimo (cuenta general, sin runner a cargo) y se
  // guarda como null, igual que el runner de un celular.
  const runnerIdRaw = String(formData.get("runnerId") ?? "").trim();
  return {
    titular: String(formData.get("titular") ?? "").trim(),
    dni: String(formData.get("dni") ?? "").trim(),
    banco: String(formData.get("banco") ?? "").trim(),
    cbu_pesos: String(formData.get("cbuPesos") ?? "").trim(),
    alias_pesos: String(formData.get("aliasPesos") ?? "").trim(),
    cbu_dolares: String(formData.get("cbuDolares") ?? "").trim(),
    alias_dolares: String(formData.get("aliasDolares") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
    tarjeta: String(formData.get("tarjeta") ?? "") === "true",
    runner_id: runnerIdRaw === "" ? null : runnerIdRaw,
    usuario: String(formData.get("usuario") ?? "").trim(),
    clave: String(formData.get("clave") ?? "").trim(),
  };
}

export async function createCuenta(formData: FormData): Promise<ResultadoAlta> {
  const campos = camposDeCuenta(formData);

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    const { error } = await sb.from("cuentas").insert({ company_id: cid, ...campos });
    if (error) {
      console.error("[cambio] alta de cuenta falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] alta de cuenta falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." };
  }

  revalidateCuentas("la cuenta se guardó");
  return { ok: true };
}

export async function updateCuenta(id: string, formData: FormData): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta la cuenta." };

  const campos = camposDeCuenta(formData);

  try {
    const sb = await createClient();
    const { error } = await sb.from("cuentas").update(campos).eq("id", id);
    if (error) {
      console.error("[cambio] edición de cuenta falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] edición de cuenta falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." };
  }

  revalidateCuentas("la cuenta se editó");
  return { ok: true };
}

export async function deleteCuenta(id: string): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta la cuenta." };

  try {
    const sb = await createClient();
    const { error } = await sb.from("cuentas").delete().eq("id", id);
    if (error) {
      console.error("[cambio] eliminación de cuenta falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo eliminar la cuenta. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] eliminación de cuenta falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo eliminar la cuenta. Probá de nuevo." };
  }

  revalidateCuentas("la cuenta se eliminó");
  return { ok: true };
}
