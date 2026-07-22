import { createClient } from "@/lib/supabase/server";
import { hoyISO } from "@/lib/finanzas/datos";
import { calcular, type OperacionCalculada } from "./calculo";
import { saldosDeCajas, rankingClientes, rankingPersonas, resumir } from "./reportes";
import type { Operacion, Caja, Moneda, TipoOperacion } from "./tipos";
import type { SaldoCaja, FilaCliente, FilaPersona, ResumenCambio } from "./reportes";

export { hoyISO };

const TIPOS: TipoOperacion[] = ["compra", "venta"];
const MONEDAS: Moneda[] = ["ARS", "USD"];

/**
 * Un valor desconocido en la base no rompe la UI: cae al default declarado,
 * pero deja rastro. Sin esto un `kind` corrupto se vuelve "compra" para
 * siempre y nada lo dice — y una compra fantasma infla el stock.
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
  exchange_clients: { name: string } | { name: string }[] | null;
};

const COLUMNAS_OPS =
  "id,op_date,created_at,kind,client_id,sender,receiver,amount,amount_currency,rate,ars_account_id,usd_account_id,fees,notes,exchange_clients(name)";

function aOperacion(r: OpRow): Operacion {
  return {
    id: r.id,
    fecha: r.op_date,
    creadaEn: r.created_at,
    tipo: unaDe("kind", TIPOS, r.kind, "compra"),
    clienteId: r.client_id,
    cliente: uno(r.exchange_clients)?.name ?? "",
    emisor: r.sender,
    receptor: r.receiver,
    monto: Number(r.amount),
    moneda: unaDe("amount_currency", MONEDAS, r.amount_currency, "USD"),
    tc: Number(r.rate),
    cajaArsId: r.ars_account_id,
    cajaUsdId: r.usd_account_id,
    costos: Number(r.fees),
    notas: r.notes,
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
  saldos: SaldoCaja[];
  clientes: FilaCliente[];
  personas: FilaPersona[];
  resumen: ResumenCambio;
};

/**
 * Una sola lectura para toda la pantalla: el costo promedio de cualquier
 * operación depende de todas las anteriores, así que no se puede paginar ni
 * traer un subconjunto sin recalcular mal.
 */
export async function getDatosCambio(hoy: string = hoyISO()): Promise<DatosCambio> {
  const sb = await createClient();
  const [{ data: ops, error: errOps }, { data: cajas, error: errCajas }] = await Promise.all([
    sb.from("exchange_ops").select(COLUMNAS_OPS),
    sb.from("exchange_accounts").select("id,name,currency,opening_balance,adjustment").eq("active", true).order("currency").order("name"),
  ]);

  // Con RLS activo una lectura sin sesión devuelve cero filas SIN error: se
  // ve igual que "todavía no cargaste operaciones". Sin este log, una
  // política mal puesta pasa por estado vacío legítimo.
  const fallo = errOps ?? errCajas;
  if (fallo) console.error("[cambio] lectura falló:", fallo.message, fallo.details ?? "");

  const operaciones = calcular(((ops ?? []) as unknown as OpRow[]).map(aOperacion));
  const listaCajas = ((cajas ?? []) as unknown as CajaRow[]).map(aCaja);

  return {
    operaciones,
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
