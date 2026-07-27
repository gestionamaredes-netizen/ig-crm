import { createClient } from "@/lib/supabase/server";
import type { Celular, CuentaOperativa } from "./celulares";

/**
 * Igual que en runners-datos.ts: PostgREST trunca en 1000 filas por defecto y
 * sin avisar. Se pide `LIMITE` filas explícitamente y, con `count: "exact"`
 * en el mismo select, se compara el total real contra lo que llegó: si no
 * coincide, el truncado ya pasó y hay que gritarlo.
 */
const LIMITE = 10000;

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

type CelularRow = {
  id: string;
  alias: string;
  model: string;
  runner_id: string | null;
  active: boolean;
  runners: { name: string } | { name: string }[] | null;
};

const COLUMNAS_CELULARES = "id,alias,model,runner_id,active,runners(name)";

function aCelular(r: CelularRow): Celular {
  return {
    id: r.id,
    alias: r.alias,
    modelo: r.model,
    runnerId: r.runner_id,
    runner: uno(r.runners)?.name ?? "",
    activo: r.active,
  };
}

export async function getCelulares(): Promise<Celular[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("phones")
    .select(COLUMNAS_CELULARES, { count: "exact" })
    .order("alias")
    .limit(LIMITE);

  if (error) console.error("[cambio] lectura de celulares falló:", error.message, error.details ?? "");

  const filas = (data ?? []) as unknown as CelularRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(`[cambio] TRUNCADO: hay ${count} celulares en la base y sólo llegaron ${filas.length}.`);
  }
  return filas.map(aCelular);
}

type CuentaOperativaRow = {
  id: string;
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

const COLUMNAS_CUENTAS_OPERATIVAS =
  "id,phone_id,holder_name,dni,cbu_pesos,alias_pesos,cbu_dolares,alias_dolares,status,notes";

function aCuentaOperativa(r: CuentaOperativaRow): CuentaOperativa {
  return {
    id: r.id,
    celularId: r.phone_id,
    titular: r.holder_name,
    dni: r.dni,
    cbuPesos: r.cbu_pesos,
    aliasPesos: r.alias_pesos,
    cbuDolares: r.cbu_dolares,
    aliasDolares: r.alias_dolares,
    estado: r.status,
    notas: r.notes,
  };
}

export async function getCuentasOperativas(): Promise<CuentaOperativa[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("phone_accounts")
    .select(COLUMNAS_CUENTAS_OPERATIVAS, { count: "exact" })
    .order("created_at")
    .limit(LIMITE);

  if (error) console.error("[cambio] lectura de cuentas operativas falló:", error.message, error.details ?? "");

  const filas = (data ?? []) as unknown as CuentaOperativaRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(
      `[cambio] TRUNCADO: hay ${count} cuentas operativas en la base y sólo llegaron ${filas.length}.`,
    );
  }
  return filas.map(aCuentaOperativa);
}
