import { createClient } from "@/lib/supabase/server";
import type { Moneda } from "./tipos";
import type { Runner, CuentaGestion, Gestion, PagoRunner, TipoGestion } from "./runners";

/**
 * Igual que en datos.ts: PostgREST trunca en 1000 filas por defecto y sin
 * avisar. Se pide `LIMITE` filas explícitamente y, con `count: "exact"` en el
 * mismo select, se compara el total real contra lo que llegó: si no coincide,
 * el truncado ya pasó y hay que gritarlo (no un console.warn: los saldos de
 * runners quedarían mal calculados con datos incompletos).
 */
const LIMITE = 10000;

const MONEDAS: Moneda[] = ["ARS", "USD"];
const TIPOS_GESTION: TipoGestion[] = ["retiro", "transferencia"];

/**
 * Un valor desconocido en la base no rompe la UI: cae al default declarado,
 * pero deja rastro en consola.
 */
function unaDe<T extends string>(campo: string, valores: T[], v: unknown, porDefecto: T): T {
  if (valores.includes(v as T)) return v as T;
  console.warn(`[cambio] valor desconocido en ${campo}:`, v);
  return porDefecto;
}

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

type RunnerRow = { id: string; name: string; active: boolean };

const COLUMNAS_RUNNERS = "id,name,active";

function aRunner(r: RunnerRow): Runner {
  return { id: r.id, nombre: r.name, activo: r.active };
}

export async function getRunners(): Promise<Runner[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("runners")
    .select(COLUMNAS_RUNNERS, { count: "exact" })
    .order("name")
    .limit(LIMITE);

  // Con RLS activo, una lectura sin sesión devuelve cero filas SIN error: se
  // ve igual que "todavía no hay runners cargados" si no se loguea.
  if (error) console.error("[cambio] lectura de runners falló:", error.message, error.details ?? "");

  const filas = (data ?? []) as unknown as RunnerRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(`[cambio] TRUNCADO: hay ${count} runners en la base y sólo llegaron ${filas.length}.`);
  }
  return filas.map(aRunner);
}

type CuentaGestionRow = {
  id: string;
  name: string;
  currency: string;
  fee: number | string;
  active: boolean;
};

const COLUMNAS_CUENTAS = "id,name,currency,fee,active";

function aCuentaGestion(r: CuentaGestionRow): CuentaGestion {
  return {
    id: r.id,
    nombre: r.name,
    // "ARS" y no "USD": si una cuenta de gestión corrupta aparenta mover
    // dólares cuando en realidad mueve pesos, el monto informativo se ve
    // absurdamente grande (salta a la vista) en vez de un número chico y
    // plausible que pasa desapercibido. Mismo criterio que aCaja en datos.ts.
    moneda: unaDe("currency", MONEDAS, r.currency, "ARS"),
    pago: Number(r.fee),
    activa: r.active,
  };
}

export async function getCuentasGestion(): Promise<CuentaGestion[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("runner_accounts")
    .select(COLUMNAS_CUENTAS, { count: "exact" })
    .order("name")
    .limit(LIMITE);

  if (error) console.error("[cambio] lectura de cuentas de gestión falló:", error.message, error.details ?? "");

  const filas = (data ?? []) as unknown as CuentaGestionRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(
      `[cambio] TRUNCADO: hay ${count} cuentas de gestión en la base y sólo llegaron ${filas.length}.`,
    );
  }
  return filas.map(aCuentaGestion);
}

type GestionRow = {
  id: string;
  gestion_date: string;
  runner_id: string;
  account_id: string;
  kind: string;
  amount: number | string;
  fee: number | string;
  notes: string;
  runner_accounts: { name: string } | { name: string }[] | null;
};

const COLUMNAS_GESTIONES =
  "id,gestion_date,runner_id,account_id,kind,amount,fee,notes,runner_accounts(name)";

function aGestion(r: GestionRow): Gestion {
  return {
    id: r.id,
    fecha: r.gestion_date,
    runnerId: r.runner_id,
    cuentaId: r.account_id,
    cuenta: uno(r.runner_accounts)?.name ?? "",
    // El kind no afecta ningún cálculo (el pago viene de `fee`, ya cargado
    // aparte); un default arbitrario alcanza, se elige el primero del enum.
    tipo: unaDe("kind", TIPOS_GESTION, r.kind, "retiro"),
    monto: Number(r.amount),
    pago: Number(r.fee),
    notas: r.notes,
  };
}

export async function getGestiones(): Promise<Gestion[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("runner_gestiones")
    .select(COLUMNAS_GESTIONES, { count: "exact" })
    .order("gestion_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(LIMITE);

  if (error) console.error("[cambio] lectura de gestiones falló:", error.message, error.details ?? "");

  const filas = (data ?? []) as unknown as GestionRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(`[cambio] TRUNCADO: hay ${count} gestiones en la base y sólo llegaron ${filas.length}.`);
  }
  return filas.map(aGestion);
}

type PagoRunnerRow = {
  id: string;
  payment_date: string;
  runner_id: string;
  amount: number | string;
  notes: string;
};

const COLUMNAS_PAGOS = "id,payment_date,runner_id,amount,notes";

function aPagoRunner(r: PagoRunnerRow): PagoRunner {
  return {
    id: r.id,
    fecha: r.payment_date,
    runnerId: r.runner_id,
    monto: Number(r.amount),
    notas: r.notes,
  };
}

export async function getPagosRunner(): Promise<PagoRunner[]> {
  const sb = await createClient();
  const { data, error, count } = await sb
    .from("runner_payments")
    .select(COLUMNAS_PAGOS, { count: "exact" })
    .order("payment_date", { ascending: false })
    .limit(LIMITE);

  if (error) console.error("[cambio] lectura de pagos a runners falló:", error.message, error.details ?? "");

  const filas = (data ?? []) as unknown as PagoRunnerRow[];
  if (typeof count === "number" && count > filas.length) {
    console.error(`[cambio] TRUNCADO: hay ${count} pagos a runners en la base y sólo llegaron ${filas.length}.`);
  }
  return filas.map(aPagoRunner);
}
