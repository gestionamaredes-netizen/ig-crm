import { createClient } from "@/lib/supabase/server";
import type { Carga, OrigenCarga } from "./cargas";

function origenDe(v: unknown): OrigenCarga {
  return v === "bancaria" ? "bancaria" : "operativa";
}

type CargaRow = {
  id: string; fecha: string; runner_id: string | null; origen: string; source_id: string;
  titular: string; etiqueta: string;
  pesos_cargados: number | string; usd_comprados: number | string; usd_recibidos: number | string; usd_retirados: number | string;
};

const COLS = "id,fecha,runner_id,origen,source_id,titular,etiqueta,pesos_cargados,usd_comprados,usd_recibidos,usd_retirados";

function aCarga(r: CargaRow): Carga {
  return {
    id: r.id, fecha: r.fecha, runnerId: r.runner_id, origen: origenDe(r.origen), sourceId: r.source_id,
    titular: r.titular, etiqueta: r.etiqueta,
    pesosCargados: Number(r.pesos_cargados), usdComprados: Number(r.usd_comprados), usdRecibidos: Number(r.usd_recibidos), usdRetirados: Number(r.usd_retirados),
  };
}

/** Cargas de un día. RLS: el runner ve solo las suyas; el admin, todas. */
export async function getCargasDelDia(fecha: string): Promise<Carga[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("cargas").select(COLS).eq("fecha", fecha).order("created_at");
  if (error) { console.error("[cambio] lectura de cargas falló:", error.message, error.details ?? ""); return []; }
  return ((data ?? []) as unknown as CargaRow[]).map(aCarga);
}

/**
 * Todas las cargas (con tope), para totales acumulados por runner en las
 * tarjetas de Runners. Mismo criterio de RLS que getCargasDelDia.
 */
export async function getCargas(): Promise<Carga[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("cargas").select(COLS).order("fecha", { ascending: false }).limit(10000);
  if (error) { console.error("[cambio] lectura de todas las cargas falló:", error.message, error.details ?? ""); return []; }
  return ((data ?? []) as unknown as CargaRow[]).map(aCarga);
}

/**
 * Cargas de un rango de fechas (desde/hasta, inclusive), para ver el total
 * movido en un período. Mismo criterio de RLS que getCargasDelDia.
 */
export async function getCargasEnRango(desde: string, hasta: string): Promise<Carga[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("cargas").select(COLS).gte("fecha", desde).lte("fecha", hasta)
    .order("fecha").order("created_at");
  if (error) { console.error("[cambio] lectura de cargas por rango falló:", error.message, error.details ?? ""); return []; }
  return ((data ?? []) as unknown as CargaRow[]).map(aCarga);
}
