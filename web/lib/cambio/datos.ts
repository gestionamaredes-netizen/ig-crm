import { createClient } from "@/lib/supabase/server";
import { hoyISO } from "@/lib/finanzas/datos";
import { calcular, type OperacionCalculada } from "./calculo";
import { saldosDeCajas, rankingClientes, rankingPersonas, resumir } from "./reportes";
import type { Operacion, Caja, Moneda, TipoOperacion } from "./tipos";
import type { SaldoCaja, FilaCliente, FilaPersona, ResumenCambio } from "./reportes";

export { hoyISO };

const TIPOS: TipoOperacion[] = ["compra", "venta", "carga", "canje"];
const MONEDAS: Moneda[] = ["ARS", "USD"];

/**
 * El costo promedio es un cálculo en cadena sobre TODAS las operaciones: si
 * PostgREST trunca la respuesta por su límite de filas, no se pierde parte
 * del listado, salen mal el stock, el costo promedio y el margen de todo.
 * Y un truncado llega SIN error, indistinguible de un resultado completo.
 */
const LIMITE_OPS = 10000;

/**
 * Un valor desconocido en la base no rompe la UI: cae al default declarado,
 * pero deja rastro. El default de cada campo se elige por cuál falla más
 * ruidoso: ver el comentario en cada llamada.
 */
function unaDe<T extends string>(campo: string, valores: T[], v: unknown, porDefecto: T): T {
  if (valores.includes(v as T)) return v as T;
  console.warn(`[cambio] valor desconocido en ${campo}:`, v);
  return porDefecto;
}

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

type OpRow = {
  id: string;
  op_date: string;
  created_at: string;
  kind: string;
  client_id: string | null;
  sender: string;
  receiver: string;
  amount: number | string;
  amount_currency: string;
  rate: number | string;
  ars_account_id: string | null;
  usd_account_id: string | null;
  fees: number | string;
  notes: string;
  comprobante_path: string;
  canje_in_account: string | null;
  canje_in_amount: number | string;
  canje_out_account: string | null;
  canje_out_amount: number | string;
  exchange_clients: { name: string } | { name: string }[] | null;
};

const COLUMNAS_OPS =
  "id,op_date,created_at,kind,client_id,sender,receiver,amount,amount_currency,rate,ars_account_id,usd_account_id,fees,notes,comprobante_path,canje_in_account,canje_in_amount,canje_out_account,canje_out_amount,exchange_clients(name)";

function aOperacion(r: OpRow): Operacion {
  return {
    id: r.id,
    fecha: r.op_date,
    creadaEn: r.created_at,
    // "venta" y no "compra": una compra fantasma infla el stock en silencio y
    // parece una operación legítima. Una venta fantasma empuja el stock hacia
    // negativo, y el stock negativo ya es una anomalía visible en este módulo
    // (se muestra en ámbar, "falta cargar algo"). Ante un dato corrupto se
    // prefiere el error que el usuario ve al que se disimula.
    tipo: unaDe("kind", TIPOS, r.kind, "venta"),
    clienteId: r.client_id,
    cliente: uno(r.exchange_clients)?.name ?? "",
    emisor: r.sender,
    receptor: r.receiver,
    monto: Number(r.amount),
    // "USD" y no "ARS": interpretar pesos como dólares da un número
    // absurdamente grande que salta a la vista; interpretar dólares como
    // pesos da un número chico y plausible que puede pasar desapercibido.
    // Ante un dato corrupto se elige el fallo ruidoso, no el que se cuela.
    moneda: unaDe("amount_currency", MONEDAS, r.amount_currency, "USD"),
    tc: Number(r.rate),
    cajaArsId: r.ars_account_id,
    cajaUsdId: r.usd_account_id,
    costos: Number(r.fees),
    notas: r.notes,
    comprobantePath: r.comprobante_path,
    canjeInId: r.canje_in_account ?? "",
    canjeInMonto: Number(r.canje_in_amount),
    canjeOutId: r.canje_out_account ?? "",
    canjeOutMonto: Number(r.canje_out_amount),
  };
}

type CajaRow = {
  id: string;
  name: string;
  currency: string;
  opening_balance: number | string;
  adjustment: number | string;
};

function aCaja(r: CajaRow): Caja {
  return {
    id: r.id,
    nombre: r.name,
    moneda: unaDe("currency", MONEDAS, r.currency, "ARS"),
    saldoInicial: Number(r.opening_balance),
    ajuste: Number(r.adjustment),
  };
}

export type DatosCambio = {
  operaciones: OperacionCalculada[];
  cajas: Caja[];
  saldos: SaldoCaja[];
  clientes: FilaCliente[];
  personas: FilaPersona[];
  resumen: ResumenCambio;
};

/**
 * Una sola lectura para toda la pantalla: el costo promedio de cualquier
 * operación depende de todas las anteriores, así que no se puede paginar ni
 * traer un subconjunto sin recalcular mal.
 *
 * Por eso mismo se pide `LIMITE_OPS` filas explícitamente (PostgREST trunca
 * en 1000 por defecto sin avisar) y, en paralelo, el conteo exacto de la
 * misma tabla: si no coinciden, el truncado ya pasó y hay que gritarlo.
 */
export async function getDatosCambio(hoy: string = hoyISO()): Promise<DatosCambio> {
  const sb = await createClient();
  const [
    { data: ops, error: errOps },
    { count: totalOps, error: errCount },
    { data: cajas, error: errCajas },
  ] = await Promise.all([
    sb.from("exchange_ops").select(COLUMNAS_OPS).range(0, LIMITE_OPS - 1),
    sb.from("exchange_ops").select("id", { count: "exact", head: true }),
    sb.from("exchange_accounts").select("id,name,currency,opening_balance,adjustment").eq("active", true).order("currency").order("name"),
  ]);

  // Con RLS activo una lectura sin sesión devuelve cero filas SIN error: se
  // ve igual que "todavía no cargaste operaciones". Sin este log, una
  // política mal puesta pasa por estado vacío legítimo.
  const fallo = errOps ?? errCount ?? errCajas;
  if (fallo) console.error("[cambio] lectura falló:", fallo.message, fallo.details ?? "");

  const operacionesCrudas = (ops ?? []) as unknown as OpRow[];

  // Un truncado llega SIN error de PostgREST: se ve exactamente igual que un
  // resultado completo, pero el costo promedio es una cadena sobre TODAS las
  // operaciones, así que faltar las primeras filas arruina el stock, el costo
  // promedio y el margen de todo lo que viene después. Esto no puede ser un
  // console.warn: es plata mal calculada en toda la pantalla.
  if (typeof totalOps === "number" && totalOps > operacionesCrudas.length) {
    console.error(
      `[cambio] TRUNCADO: hay ${totalOps} operaciones en la base y sólo llegaron ${operacionesCrudas.length}. ` +
        "Los totales (stock, costo promedio, margen) están incompletos.",
    );
  }

  const operaciones = calcular(operacionesCrudas.map(aOperacion));
  const listaCajas = ((cajas ?? []) as unknown as CajaRow[]).map(aCaja);

  return {
    operaciones,
    cajas: listaCajas,
    saldos: saldosDeCajas(operaciones, listaCajas),
    clientes: rankingClientes(operaciones),
    personas: rankingPersonas(operaciones),
    resumen: resumir(operaciones, hoy),
  };
}

export async function getClientesParaOperacion(): Promise<{ id: string; nombre: string }[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("exchange_clients").select("id,name").eq("active", true).order("name");
  // Sin este log, un error de lectura se ve igual que "no hay clientes": el
  // select queda vacío y no se puede cargar ninguna operación.
  if (error) console.error("[cambio] lectura falló:", error.message, error.details ?? "");
  return (data ?? []).map((c) => ({ id: c.id as string, nombre: c.name as string }));
}

export async function getCajasParaOperacion(): Promise<{ id: string; nombre: string; moneda: Moneda }[]> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("exchange_accounts")
    .select("id,name,currency")
    .eq("active", true)
    .order("name");
  if (error) console.error("[cambio] lectura falló:", error.message, error.details ?? "");
  return (data ?? []).map((c) => ({
    id: c.id as string,
    nombre: c.name as string,
    moneda: unaDe("currency", MONEDAS, c.currency, "ARS"),
  }));
}

export async function getPersonasParaOperacion(): Promise<{ id: string; nombre: string }[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("exchange_people").select("id,name").eq("active", true).order("name");
  // Mismo criterio que getClientesParaOperacion: un error de lectura se ve
  // igual que "no hay personas" si no se loguea.
  if (error) console.error("[cambio] lectura falló:", error.message, error.details ?? "");
  return (data ?? []).map((p) => ({ id: p.id as string, nombre: p.name as string }));
}

export type ContactoAdmin = { id: string; nombre: string; activo: boolean };

/** Clientes y personas TODOS (activos e inactivos) para la pantalla de Contactos. */
export async function getContactos(): Promise<{ clientes: ContactoAdmin[]; personas: ContactoAdmin[] }> {
  const sb = await createClient();
  const [{ data: cli, error: errCli }, { data: per, error: errPer }] = await Promise.all([
    sb.from("exchange_clients").select("id,name,active").order("name"),
    sb.from("exchange_people").select("id,name,active").order("name"),
  ]);
  const fallo = errCli ?? errPer;
  if (fallo) console.error("[cambio] lectura falló:", fallo.message, fallo.details ?? "");
  const aContacto = (r: { id: string; name: string; active: boolean }): ContactoAdmin => ({
    id: r.id,
    nombre: r.name,
    activo: r.active,
  });
  return {
    clientes: ((cli ?? []) as { id: string; name: string; active: boolean }[]).map(aContacto),
    personas: ((per ?? []) as { id: string; name: string; active: boolean }[]).map(aContacto),
  };
}
