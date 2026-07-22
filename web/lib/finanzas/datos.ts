import { createClient } from "@/lib/supabase/server";
import { resumir, estadoDeVencimiento, costoUnitario } from "./totales";
import type {
  Gasto,
  ResumenGastos,
  Vencimiento,
  CategoriaGasto,
  PeriodoGasto,
  OrigenGasto,
} from "./tipos";

export type FilaGasto = Gasto & {
  vencimiento: Vencimiento | null;
  /** null cuando la cantidad es cero: no inventamos una división por cero. */
  unitario: number | null;
};

/** Fecha de hoy en YYYY-MM-DD, hora local. */
export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const CATEGORIAS: CategoriaGasto[] = ["dominio", "hosting", "herramienta", "merch", "servicio", "otro"];
const PERIODOS: PeriodoGasto[] = ["unico", "mensual", "anual"];
const ORIGENES: OrigenGasto[] = ["manual", "meta", "google"];

/** Un valor desconocido en la base no rompe la UI: cae al default declarado. */
function unaDe<T extends string>(valores: T[], v: unknown, porDefecto: T): T {
  return valores.includes(v as T) ? (v as T) : porDefecto;
}

type GastoRow = {
  id: string;
  company_id: string | null;
  category: string;
  concept: string;
  vendor: string;
  external_ref: string;
  amount: number | string;
  quantity: number;
  currency: string;
  paid_at: string | null;
  renews_at: string | null;
  period: string;
  source: string;
  notes: string;
  companies: { name: string; color: string } | { name: string; color: string }[] | null;
};

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

function aGasto(r: GastoRow): Gasto {
  const empresa = uno(r.companies);
  return {
    id: r.id,
    empresaId: r.company_id,
    // Sin empresa es un gasto de estructura de la agencia, y así se rotula.
    empresa: empresa?.name ?? "Iniciativa Global",
    empresaColor: empresa?.color ?? "#7d7bf0",
    categoria: unaDe(CATEGORIAS, r.category, "otro"),
    concepto: r.concept,
    proveedor: r.vendor,
    referencia: r.external_ref,
    monto: Number(r.amount),
    cantidad: r.quantity,
    moneda: r.currency,
    pagadoEl: r.paid_at,
    renuevaEl: r.renews_at,
    periodo: unaDe(PERIODOS, r.period, "unico"),
    origen: unaDe(ORIGENES, r.source, "manual"),
    notas: r.notes,
  };
}

const COLUMNAS =
  "id,company_id,category,concept,vendor,external_ref,amount,quantity,currency,paid_at,renews_at,period,source,notes,companies(name,color)";

async function cargarTodo() {
  const sb = await createClient();
  const [{ data: gastos, error: errGastos }, { data: metricas, error: errMetricas }] = await Promise.all([
    sb.from("expenses").select(COLUMNAS),
    sb.from("campaign_metrics").select("cost"),
  ]);

  // Con RLS activo, una lectura sin sesión devuelve cero filas SIN error, o sea
  // que se ve igual que "todavía no hay gastos". Sin este log, una política mal
  // puesta o una tabla faltante pasarían por estado vacío legítimo.
  const fallo = errGastos ?? errMetricas;
  if (fallo) console.error("[finanzas] lectura falló:", fallo.message, fallo.details ?? "");

  return {
    gastos: ((gastos ?? []) as unknown as GastoRow[]).map(aGasto),
    // Gasto de pauta ejecutado y reportado, no el presupuesto de las campañas.
    costoDePauta: ((metricas ?? []) as { cost: number | string }[]).reduce((s, m) => s + Number(m.cost), 0),
  };
}

function aFila(g: Gasto, hoy: string): FilaGasto {
  return {
    ...g,
    vencimiento: estadoDeVencimiento(g.renuevaEl, hoy),
    unitario: costoUnitario(g.monto, g.cantidad),
  };
}

export async function getGastos(hoy: string = hoyISO()): Promise<FilaGasto[]> {
  const { gastos } = await cargarTodo();
  return gastos.map((g) => aFila(g, hoy)).sort((a, b) => b.monto - a.monto);
}

export async function getResumenGastos(hoy: string = hoyISO()): Promise<ResumenGastos> {
  const { gastos, costoDePauta } = await cargarTodo();
  return resumir(gastos, costoDePauta, hoy);
}

export async function getProximosVencimientos(
  hoy: string = hoyISO(),
  dentroDeDias = 60,
): Promise<FilaGasto[]> {
  const { gastos } = await cargarTodo();
  return gastos
    .map((g) => aFila(g, hoy))
    .filter((f) => f.vencimiento !== null && f.vencimiento.dias <= dentroDeDias)
    .sort((a, b) => a.vencimiento!.dias - b.vencimiento!.dias);
}

export async function getEmpresasParaGasto(): Promise<{ id: string; nombre: string }[]> {
  const sb = await createClient();
  const { data } = await sb.from("companies").select("id,name").order("name");
  return (data ?? []).map((c) => ({ id: c.id as string, nombre: c.name as string }));
}
