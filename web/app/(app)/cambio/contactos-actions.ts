"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ResultadoContacto = { ok: true; id: string; nombre: string } | { ok: false; error: string };
type ResultadoSimple = { ok: true } | { ok: false; error: string };

// company_id de GESTIONES MA, resuelto por nombre. Un contacto siempre
// pertenece a esa empresa (la caja es exclusiva de Gestiones MA).
async function empresaId(sb: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data, error } = await sb.from("companies").select("id").ilike("name", "%gestiones%ma%").limit(1).single();
  if (error || !data) {
    console.error("[cambio] no se pudo resolver la empresa:", error?.message ?? "sin datos", error?.details ?? "");
    return null;
  }
  return data.id as string;
}

async function crearContacto(tabla: "exchange_clients" | "exchange_people", nombre: string): Promise<ResultadoContacto> {
  const limpio = nombre.trim();
  if (!limpio) return { ok: false, error: "El nombre no puede estar vacío." };

  try {
    const sb = await createClient();
    const cid = await empresaId(sb);
    if (!cid) return { ok: false, error: "No se encontró la empresa. Avisá al administrador." };

    const { data, error } = await sb.from(tabla).insert({ company_id: cid, name: limpio }).select("id,name").single();
    if (error) {
      // 23505 = violación de índice único: ya existe ese nombre.
      if (error.code === "23505") return { ok: false, error: "Ya existe un contacto con ese nombre." };
      console.error("[cambio] alta de contacto falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo guardar. Probá de nuevo." };
    }
    // El insert commiteó: revalidatePath aislado para no reportar como fallida
    // un alta que sí ocurrió.
    try {
      revalidatePath("/cambio");
    } catch (e) {
      console.error("[cambio] alta ok pero revalidatePath falló:", e instanceof Error ? e.message : String(e));
    }
    return { ok: true, id: data.id as string, nombre: data.name as string };
  } catch (e) {
    console.error("[cambio] alta de contacto falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo guardar. Probá de nuevo." };
  }
}

export async function createExchangeClient(nombre: string): Promise<ResultadoContacto> {
  return crearContacto("exchange_clients", nombre);
}

export async function createExchangePerson(nombre: string): Promise<ResultadoContacto> {
  return crearContacto("exchange_people", nombre);
}

export async function setContactoActivo(
  tabla: "cliente" | "persona",
  id: string,
  activo: boolean,
): Promise<ResultadoSimple> {
  const nombreTabla = tabla === "cliente" ? "exchange_clients" : "exchange_people";
  try {
    const sb = await createClient();
    const { error } = await sb.from(nombreTabla).update({ active: activo }).eq("id", id);
    if (error) {
      console.error("[cambio] baja/alta de contacto falló:", error.message, error.details ?? "");
      return { ok: false, error: "No se pudo actualizar. Probá de nuevo." };
    }
    try {
      revalidatePath("/cambio");
    } catch (e) {
      console.error("[cambio] update ok pero revalidatePath falló:", e instanceof Error ? e.message : String(e));
    }
    return { ok: true };
  } catch (e) {
    console.error("[cambio] baja/alta de contacto falló:", e instanceof Error ? e.message : String(e));
    return { ok: false, error: "No se pudo actualizar. Probá de nuevo." };
  }
}
