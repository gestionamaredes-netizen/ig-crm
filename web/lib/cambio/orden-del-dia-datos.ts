import { createClient } from "@/lib/supabase/server";
import type { OrdenDelDiaRegistro, CargaCuentasAuditoria } from "./orden-del-dia";

const LIMITE = 10000;

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

type OrdenDelDiaRow = {
  id: string;
  fecha: string;
  cuenta_id: string;
  runner_id: string | null;
  pesos_cargados: number | string;
  usd_comprados: number | string;
  alias_pesos: string;
  alias_dolares: string;
  dni: string;
  pin: string;
  created_at: string;
  cuentas: { titular: string; banco: string } | null;
  runners: { name: string } | { name: string }[] | null;
};

type CargaAuditoriaRow = {
  id: string;
  fecha: string;
  runner_id: string | null;
  cuenta_id: string | null;
  pesos_cargados: number | string;
  usd_comprados: number | string;
  accion: string;
  datos_anteriores: Record<string, unknown>;
  datos_nuevos: Record<string, unknown>;
  created_at: string;
  cuentas: { titular: string } | null;
  runners: { name: string } | { name: string }[] | null;
};

const COLS_ORDEN =
  "id,fecha,cuenta_id,runner_id,pesos_cargados,usd_comprados,alias_pesos,alias_dolares,dni,pin,created_at,cuentas(titular,banco),runners(name)";

const COLS_AUDITORIA =
  "id,fecha,runner_id,cuenta_id,pesos_cargados,usd_comprados,accion,datos_anteriores,datos_nuevos,created_at,cuentas(titular),runners(name)";

function aOrdenDelDia(r: OrdenDelDiaRow): OrdenDelDiaRegistro {
  return {
    id: r.id,
    fecha: r.fecha,
    cuentaId: r.cuenta_id,
    titular: r.cuentas?.titular ?? "",
    banco: r.cuentas?.banco ?? "",
    runnerId: r.runner_id,
    runnerNombre: uno(r.runners)?.name ?? "",
    pesosCargados: Number(r.pesos_cargados),
    usdComprados: Number(r.usd_comprados),
    aliasPesos: r.alias_pesos,
    aliasDolares: r.alias_dolares,
    dni: r.dni,
    pin: r.pin,
    creadaEn: r.created_at,
  };
}

function aCargaAuditoria(r: CargaAuditoriaRow): CargaCuentasAuditoria {
  return {
    id: r.id,
    fecha: r.fecha,
    runnerId: r.runner_id,
    runnerNombre: uno(r.runners)?.name ?? "",
    cuentaId: r.cuenta_id,
    titular: r.cuentas?.titular ?? "",
    pesosCargados: Number(r.pesos_cargados),
    usdComprados: Number(r.usd_comprados),
    accion: (r.accion as "crear" | "actualizar" | "eliminar") ?? "crear",
    datosAnteriores: r.datos_anteriores ?? {},
    datosNuevos: r.datos_nuevos ?? {},
    creadaEn: r.created_at,
  };
}

export async function getOrdenDelDia(fecha: string): Promise<OrdenDelDiaRegistro[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("orden_del_dia")
    .select(COLS_ORDEN, { count: "exact" })
    .eq("fecha", fecha)
    .order("created_at")
    .limit(LIMITE);

  if (error) {
    console.error("[orden-del-dia] lectura falló:", error.message, error.details ?? "");
    return [];
  }

  const filas = (data ?? []) as unknown as OrdenDelDiaRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(`[orden-del-dia] TRUNCADO: hay ${count} registros y solo llegaron ${filas.length}.`);
  }
  return filas.map(aOrdenDelDia);
}

export async function getOrdenDelDiaEnRango(desde: string, hasta: string): Promise<OrdenDelDiaRegistro[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("orden_del_dia")
    .select(COLS_ORDEN, { count: "exact" })
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(LIMITE);

  if (error) {
    console.error("[orden-del-dia] lectura por rango falló:", error.message, error.details ?? "");
    return [];
  }

  const filas = (data ?? []) as unknown as OrdenDelDiaRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(`[orden-del-dia] TRUNCADO en rango: hay ${count} registros y solo llegaron ${filas.length}.`);
  }
  return filas.map(aOrdenDelDia);
}

export async function getCargaAuditoria(fecha: string): Promise<CargaCuentasAuditoria[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("carga_cuentas_auditoria")
    .select(COLS_AUDITORIA, { count: "exact" })
    .eq("fecha", fecha)
    .order("created_at", { ascending: false })
    .limit(LIMITE);

  if (error) {
    console.error("[orden-del-dia] lectura de auditoría falló:", error.message, error.details ?? "");
    return [];
  }

  const filas = (data ?? []) as unknown as CargaAuditoriaRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(`[orden-del-dia] TRUNCADO en auditoría: hay ${count} registros y solo llegaron ${filas.length}.`);
  }
  return filas.map(aCargaAuditoria);
}

export async function getCargaAuditoriaEnRango(desde: string, hasta: string): Promise<CargaCuentasAuditoria[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("carga_cuentas_auditoria")
    .select(COLS_AUDITORIA, { count: "exact" })
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(LIMITE);

  if (error) {
    console.error("[orden-del-dia] lectura de auditoría en rango falló:", error.message, error.details ?? "");
    return [];
  }

  const filas = (data ?? []) as unknown as CargaAuditoriaRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(
      `[orden-del-dia] TRUNCADO en auditoría por rango: hay ${count} registros y solo llegaron ${filas.length}.`,
    );
  }
  return filas.map(aCargaAuditoria);
}
