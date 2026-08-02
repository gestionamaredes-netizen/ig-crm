"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parsearMonto } from "@/lib/finanzas/montos";
import type { OrigenCarga } from "@/lib/cambio/cargas";

export type ResultadoAlta = { ok: true } | { ok: false; error: string };

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

// Vacío = 0; si hay algo, tiene que ser un monto válido (o null = inválido).
function montoOpcional(texto: string): number | null {
  return texto.trim() === "" ? 0 : parsearMonto(texto);
}

async function empresaId(sb: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data, error } = await sb.from("companies").select("id").ilike("name", "%gestiones%ma%").limit(1).single();
  if (error) { console.error("[cambio] búsqueda de empresa falló:", error.message, error.details ?? ""); return null; }
  if (!data) { console.error("[cambio] no se encontró la empresa GESTIONES MA en companies"); return null; }
  return data.id as string;
}

function revalidarCargas(mensaje: string): void {
  try {
    revalidatePath("/panel");
    revalidatePath("/cambio/cargas");
  } catch (e) {
    console.error(`[cambio] ${mensaje} pero revalidatePath falló:`, e instanceof Error ? e.message : String(e));
  }
}

type PhoneAccountRow = { holder_name: string; runner_id: string | null; phones: { alias: string; runner_id: string | null } | { alias: string; runner_id: string | null }[] | null };
type CuentaRow = { titular: string; runner_id: string | null };

export async function marcarCarga(
  origen: OrigenCarga, sourceId: string, fecha: string, pesos: string, comprados: string, retirados: string,
): Promise<ResultadoAlta> {
  if (!sourceId) return { ok: false, error: "Falta la cuenta." };
  if (!fecha) return { ok: false, error: "Falta la fecha." };
  if (origen !== "operativa" && origen !== "bancaria") return { ok: false, error: "Cuenta inválida." };

  const p = montoOpcional(pesos);
  const c = montoOpcional(comprados);
  const r = montoOpcional(retirados);
  if (p === null || c === null || r === null) return { ok: false, error: "Revisá los montos: alguno no es válido." };
  if (p === 0 && c === 0 && r === 0) return { ok: false, error: "Cargá al menos un monto." };

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    // Snapshot + runner desde la cuenta.
    let titular = "";
    let etiqueta = "";
    let runnerId: string | null = null;
    if (origen === "operativa") {
      const { data, error } = await sb.from("phone_accounts").select("holder_name,phones(alias,runner_id)").eq("id", sourceId).limit(1).single();
      if (error) console.error("[cambio] lectura de cuenta operativa (carga) falló:", error.message, error.details ?? "");
      const row = data as unknown as PhoneAccountRow | null;
      if (!row) return { ok: false, error: "No se encontró la cuenta." };
      titular = row.holder_name ?? "";
      etiqueta = uno(row.phones)?.alias ?? "";
      runnerId = uno(row.phones)?.runner_id ?? null;
    } else {
      const { data, error } = await sb.from("cuentas").select("titular,runner_id").eq("id", sourceId).limit(1).single();
      if (error) console.error("[cambio] lectura de cuenta bancaria (carga) falló:", error.message, error.details ?? "");
      const row = data as unknown as CuentaRow | null;
      if (!row) return { ok: false, error: "No se encontró la cuenta." };
      titular = row.titular ?? "";
      etiqueta = "Bancaria";
      runnerId = row.runner_id ?? null;
    }

    const { error } = await sb.from("cargas").upsert(
      { company_id: cid, fecha, origen, source_id: sourceId, runner_id: runnerId, titular, etiqueta,
        pesos_cargados: p, usd_comprados: c, usd_retirados: r },
      { onConflict: "company_id,origen,source_id,fecha" },
    );
    if (error) {
      console.error("[cambio] marcar carga falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar la carga. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] marcarCarga falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar la carga. Probá de nuevo." };
  }

  revalidarCargas("la carga se guardó");
  return { ok: true };
}

export async function desmarcarCarga(id: string): Promise<ResultadoAlta> {
  if (!id) return { ok: false, error: "Falta la carga." };
  try {
    const sb = await createClient();
    const { error } = await sb.from("cargas").delete().eq("id", id);
    if (error) {
      console.error("[cambio] desmarcar carga falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo desmarcar. Probá de nuevo." };
    }
  } catch (e) {
    console.error("[cambio] desmarcarCarga falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo desmarcar. Probá de nuevo." };
  }
  revalidarCargas("la carga se borró");
  return { ok: true };
}
