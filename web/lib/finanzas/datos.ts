import { createClient } from "@/lib/supabase/server";
import { resumir, estadoDeVencimiento, costoUnitario } from "./totales";
import { periodosVigentes } from "@/lib/pautas/metricas";
import { hoyISO } from "@/lib/fecha";
import type {
  Gasto,
  ResumenGastos,
  Vencimiento,
  CategoriaGasto,
  PeriodoGasto,
  OrigenGasto,
} from "./tipos";
import type { OrigenMetrica } from "@/lib/pautas/tipos";

export type FilaGasto = Gasto & {
  vencimiento: Vencimiento | null;
  /** null cuando la cantidad es cero: no inventamos una división por cero. */
  unitario: number | null;
};

// Re-exportado por compatibilidad: lib/cambio/datos.ts y las páginas de
// servidor lo importan desde acá. La definición vive en lib/fecha.ts (sin
// dependencias de next/headers) para que también pueda importarse desde
// componentes "use client" como runner-forms.tsx sin arrastrar el cliente de
// Supabase de servidor al bundle del browser.
export { hoyISO };

const CATEGORIAS: CategoriaGasto[] = ["dominio", "hosting", "herramienta", "merch", "servicio", "otro"];
const PERIODOS: PeriodoGasto[] = ["unico", "mensual", "anual"];
const ORIGENES: OrigenGasto[] = ["manual", "meta", "google"];

/**
 * Un valor desconocido en la base no rompe la UI: cae al default declarado.
 * Pero cae en silencio si nadie mira la consola, así que se deja rastro: sin
 * esto, un `category` corrupto se vuelve "Otro" para siempre y nada lo dice.
 */
function unaDe<T extends string>(campo: string, valores: T[], v: unknown, porDefecto: T): T {
  if (valores.includes(v as T)) return v as T;
  console.warn(`[finanzas] valor desconocido en ${campo}:`, v);
  return porDefecto;
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
    categoria: unaDe("category", CATEGORIAS, r.category, "otro"),
    concepto: r.concept,
    proveedor: r.vendor,
    referencia: r.external_ref,
    monto: Number(r.amount),
    cantidad: r.quantity,
    moneda: r.currency,
    pagadoEl: r.paid_at,
    renuevaEl: r.renews_at,
    periodo: unaDe("period", PERIODOS, r.period, "unico"),
    origen: unaDe("source", ORIGENES, r.source, "manual"),
    notas: r.notes,
  };
}

const COLUMNAS =
  "id,company_id,category,concept,vendor,external_ref,amount,quantity,currency,paid_at,renews_at,period,source,notes,companies(name,color)";

type MetricaRow = { cost: number | string; period_start: string; period_end: string; source: string };
type PeriodoDeGasto = { desde: string; hasta: string; origen: OrigenMetrica; cost: number };

function aPeriodoDeGasto(r: MetricaRow): PeriodoDeGasto {
  return {
    desde: r.period_start,
    hasta: r.period_end,
    // Misma normalización que lib/pautas/datos.ts aPeriodo: cualquier valor
    // que no sea "sync" se trata como manual.
    origen: r.source === "sync" ? "sync" : "manual",
    cost: Number(r.cost),
  };
}

async function cargarTodo(hoy: string = hoyISO()) {
  const sb = await createClient();
  const [{ data: gastos, error: errGastos }, { data: metricas, error: errMetricas }] = await Promise.all([
    sb.from("expenses").select(COLUMNAS),
    sb.from("campaign_metrics").select("cost,period_start,period_end,source"),
  ]);

  // Con RLS activo, una lectura sin sesión devuelve cero filas SIN error, o sea
  // que se ve igual que "todavía no hay gastos". Sin este log, una política mal
  // puesta o una tabla faltante pasarían por estado vacío legítimo.
  const fallo = errGastos ?? errMetricas;
  if (fallo) console.error("[finanzas] lectura falló:", fallo.message, fallo.details ?? "");

  // Mismo pipeline que lib/pautas/datos.ts getResumenPautas: los tramos pasan
  // por la misma periodosVigentes (dedup manual-vs-sync) antes de sumarse, así
  // que "gasto de pauta" no puede quedar en $20.000 acá y $40.000 allá por una
  // fila manual y una de sync que cubren el mismo tramo. No es sólo el mismo
  // criterio: es la misma función, para que las dos páginas no puedan
  // divergir sin que ambas cambien a la vez.
  const vigentes = periodosVigentes((metricas ?? []).map(aPeriodoDeGasto));
  // El corte "de este mes" sí es una regla propia de acá (no hay equivalente
  // reusable en lib/pautas/), pero usa el mismo criterio que getResumenPautas:
  // por period_end, sin prorratear entre meses.
  const inicioDeMes = `${hoy.slice(0, 7)}-01`;

  return {
    gastos: ((gastos ?? []) as unknown as GastoRow[]).map(aGasto),
    // Gasto de pauta ejecutado y reportado, no el presupuesto de las campañas.
    costoDePauta: vigentes.reduce((s, p) => s + p.cost, 0),
    costoDePautaDelMes: vigentes
      .filter((p) => p.hasta >= inicioDeMes)
      .reduce((s, p) => s + p.cost, 0),
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
  const { gastos } = await cargarTodo(hoy);
  return gastos.map((g) => aFila(g, hoy)).sort((a, b) => b.monto - a.monto);
}

export async function getResumenGastos(hoy: string = hoyISO()): Promise<ResumenGastos> {
  const { gastos, costoDePauta, costoDePautaDelMes } = await cargarTodo(hoy);
  return resumir(gastos, costoDePauta, costoDePautaDelMes, hoy);
}

export async function getProximosVencimientos(
  hoy: string = hoyISO(),
  dentroDeDias = 60,
): Promise<FilaGasto[]> {
  const { gastos } = await cargarTodo(hoy);
  return gastos
    .map((g) => aFila(g, hoy))
    .filter((f) => f.vencimiento !== null && f.vencimiento.dias <= dentroDeDias)
    .sort((a, b) => a.vencimiento!.dias - b.vencimiento!.dias);
}

export async function getEmpresasParaGasto(): Promise<{ id: string; nombre: string }[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("companies").select("id,name").order("name");
  // Sin este log, un error de lectura se ve igual que "la agencia no tiene
  // empresas cargadas": el dropdown queda vacío y el gasto termina imputado
  // a la entidad equivocada sin que nada lo avise.
  if (error) console.error("[finanzas] lectura falló:", error.message, error.details ?? "");
  return (data ?? []).map((c) => ({ id: c.id as string, nombre: c.name as string }));
}
