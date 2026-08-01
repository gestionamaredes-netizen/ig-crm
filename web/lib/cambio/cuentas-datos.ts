import { createClient } from "@/lib/supabase/server";
import type { Cuenta } from "./cuentas";

/**
 * Igual que en celulares-datos.ts: PostgREST trunca en 1000 filas por defecto y
 * sin avisar. Se pide `LIMITE` filas explícitamente y, con `count: "exact"`
 * en el mismo select, se compara el total real contra lo que llegó: si no
 * coincide, el truncado ya pasó y hay que gritarlo.
 */
const LIMITE = 10000;

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

type CuentaRow = {
  id: string;
  titular: string;
  dni: string;
  cbu_pesos: string;
  alias_pesos: string;
  cbu_dolares: string;
  alias_dolares: string;
  notes: string;
  tarjeta: boolean;
  runner_id: string | null;
  runners: { name: string } | { name: string }[] | null;
};

const COLUMNAS_CUENTAS =
  "id,titular,dni,cbu_pesos,alias_pesos,cbu_dolares,alias_dolares,notes,tarjeta,runner_id,runners(name)";

function aCuenta(r: CuentaRow): Cuenta {
  return {
    id: r.id,
    titular: r.titular,
    dni: r.dni,
    cbuPesos: r.cbu_pesos,
    aliasPesos: r.alias_pesos,
    cbuDolares: r.cbu_dolares,
    aliasDolares: r.alias_dolares,
    notas: r.notes,
    tarjeta: Boolean(r.tarjeta),
    runnerId: r.runner_id,
    runner: uno(r.runners)?.name ?? "",
  };
}

export async function getCuentas(): Promise<Cuenta[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("cuentas")
    .select(COLUMNAS_CUENTAS, { count: "exact" })
    .order("titular")
    .limit(LIMITE);

  if (error) console.error("[cambio] lectura de cuentas falló:", error.message, error.details ?? "");

  const filas = (data ?? []) as unknown as CuentaRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(`[cambio] TRUNCADO: hay ${count} cuentas en la base y sólo llegaron ${filas.length}.`);
  }
  return filas.map(aCuenta);
}
