import { createClient } from "@/lib/supabase/server";
import { sumarPeriodos, derivar, periodosVigentes } from "./metricas";
import { estadoDeFrescura, type Frescura } from "./frescura";
import type {
  PeriodoMetrica,
  EstadoCampana,
  Plataforma,
  TotalesPauta,
  MetricasDerivadas,
} from "./tipos";

export type FilaCampana = {
  id: string;
  nombre: string;
  empresa: string;
  empresaColor: string;
  plataforma: Plataforma;
  estado: EstadoCampana;
  presupuestoDiario: number;
  totales: TotalesPauta;
  leadsAtribuidos: number;
  derivadas: MetricasDerivadas;
  frescura: Frescura;
};

export type ResumenPautas = {
  inversion: number;
  leads: number;
  costoPorLead: number | null;
  serie: number[];
  campanasActivas: number;
  campanasEnBorrador: number;
  primeraEnBorrador: string | null;
};

export type DetalleCampana = FilaCampana & {
  periodos: PeriodoMetrica[];
  leads: { id: string; nombre: string; valor: number; gclid: string }[];
};

export type Opcion = { id: string; nombre: string };
export type OpcionCuenta = { id: string; nombre: string; empresaId: string };

type MetricaRow = {
  id: string;
  campaign_id: string;
  period_start: string;
  period_end: string;
  source: string;
  impressions: number;
  clicks: number;
  cost: number | string;
  conversions: number;
  created_at: string;
};

type LeadRow = { id: string; name: string; value: number | string; gclid: string | null; campaign_id: string; created_at: string };

function aPeriodo(r: MetricaRow): PeriodoMetrica {
  return {
    id: r.id,
    campanaId: r.campaign_id,
    desde: r.period_start,
    hasta: r.period_end,
    origen: r.source === "sync" ? "sync" : "manual",
    impresiones: r.impressions,
    clics: r.clicks,
    costo: Number(r.cost),
    clicsWhatsapp: r.conversions,
  };
}

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

/** Primer día del mes en curso, en formato YYYY-MM-DD. */
function inicioDeMes(ahora: Date): string {
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Cantidad de días que cubre un tramo, con `hasta` inclusivo. */
function diasDelTramo(p: PeriodoMetrica): number {
  const ms = new Date(p.hasta).getTime() - new Date(p.desde).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

async function cargarTodo() {
  const sb = await createClient();
  const [{ data: campanas }, { data: metricas }, { data: leads }] = await Promise.all([
    sb.from("campaigns").select("id,name,status,objective,daily_budget,companies(name,color),ad_accounts(platform)"),
    sb.from("campaign_metrics").select("id,campaign_id,period_start,period_end,source,impressions,clicks,cost,conversions,created_at"),
    sb.from("leads").select("id,name,value,gclid,campaign_id,created_at").not("campaign_id", "is", null),
  ]);
  return {
    campanas: campanas ?? [],
    metricas: (metricas ?? []) as MetricaRow[],
    leads: (leads ?? []) as unknown as LeadRow[],
  };
}

export async function getCampanas(ahora: Date = new Date()): Promise<FilaCampana[]> {
  const { campanas, metricas, leads } = await cargarTodo();

  return campanas
    .map((c) => {
      const propias = metricas.filter((m) => m.campaign_id === c.id);
      const vigentes = periodosVigentes(propias.map(aPeriodo));
      const totales = sumarPeriodos(vigentes);
      const leadsAtribuidos = leads.filter((l) => l.campaign_id === c.id).length;
      const empresa = uno(c.companies as { name: string; color: string } | { name: string; color: string }[] | null);
      const cuenta = uno(c.ad_accounts as { platform: string } | { platform: string }[] | null);

      const ultima = propias.length
        ? new Date(Math.max(...propias.map((m) => new Date(m.created_at).getTime())))
        : null;
      const estado = c.status as EstadoCampana;

      return {
        id: c.id as string,
        nombre: c.name as string,
        empresa: empresa?.name ?? "",
        empresaColor: empresa?.color ?? "#7d7bf0",
        plataforma: (cuenta?.platform === "meta" ? "meta" : "google") as Plataforma,
        estado,
        presupuestoDiario: Number(c.daily_budget),
        totales,
        leadsAtribuidos,
        derivadas: derivar(totales, leadsAtribuidos),
        frescura: estadoDeFrescura(ultima, ahora, estado),
      };
    })
    .sort((a, b) => b.totales.costo - a.totales.costo);
}

export async function getResumenPautas(ahora: Date = new Date()): Promise<ResumenPautas> {
  const { campanas, metricas, leads } = await cargarTodo();
  const inicio = inicioDeMes(ahora);

  // Inversión y leads se recortan al mismo mes: si midiéramos el gasto del mes
  // contra los leads de toda la historia, el costo por lead saldría mentiroso.
  const vigentes = periodosVigentes(metricas.map(aPeriodo)).filter((p) => p.hasta >= inicio);
  const totales = sumarPeriodos(vigentes);
  const leadsDelMes = leads.filter((l) => l.created_at.slice(0, 10) >= inicio).length;

  // Serie de gasto de los últimos 30 días, un punto por día.
  const serie: number[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(ahora.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    const delDia = vigentes.filter((p) => p.desde <= d && d <= p.hasta);
    // Un tramo semanal reparte su gasto en partes iguales entre sus días.
    serie.push(delDia.reduce((s, p) => s + p.costo / diasDelTramo(p), 0));
  }

  const borradores = campanas.filter((c) => c.status === "borrador");
  return {
    inversion: totales.costo,
    leads: leadsDelMes,
    costoPorLead: derivar(totales, leadsDelMes).costoPorLead,
    serie,
    campanasActivas: campanas.filter((c) => c.status === "activa").length,
    campanasEnBorrador: borradores.length,
    primeraEnBorrador: (borradores[0]?.name as string) ?? null,
  };
}

export async function getCampana(id: string, ahora: Date = new Date()): Promise<DetalleCampana | null> {
  const fila = (await getCampanas(ahora)).find((c) => c.id === id);
  if (!fila) return null;

  const sb = await createClient();
  const [{ data: metricas }, { data: leads }] = await Promise.all([
    sb
      .from("campaign_metrics")
      .select("id,campaign_id,period_start,period_end,source,impressions,clicks,cost,conversions,created_at")
      .eq("campaign_id", id)
      .order("period_start", { ascending: false }),
    sb.from("leads").select("id,name,value,gclid").eq("campaign_id", id).order("value", { ascending: false }),
  ]);

  return {
    ...fila,
    periodos: ((metricas ?? []) as MetricaRow[]).map(aPeriodo),
    leads: (leads ?? []).map((l) => ({
      id: l.id as string,
      nombre: l.name as string,
      valor: Number(l.value),
      gclid: (l.gclid as string) ?? "",
    })),
  };
}

export async function getOpcionesAlta() {
  const sb = await createClient();
  const [{ data: cuentas }, { data: campanas }] = await Promise.all([
    sb.from("ad_accounts").select("id,name,platform,company_id").eq("active", true),
    sb.from("campaigns").select("id,name").order("name"),
  ]);
  return {
    cuentas: (cuentas ?? []).map((c) => ({
      id: c.id as string,
      nombre: `${c.name || "Cuenta"} · ${c.platform === "meta" ? "Meta Ads" : "Google Ads"}`,
      empresaId: c.company_id as string,
    })) as OpcionCuenta[],
    campanas: (campanas ?? []).map((c) => ({ id: c.id as string, nombre: c.name as string })) as Opcion[],
  };
}

export async function getCampanasDeEmpresa(slug: string): Promise<Opcion[]> {
  const sb = await createClient();
  const { data: empresa } = await sb.from("companies").select("id").eq("slug", slug).single();
  if (!empresa) return [];
  const { data } = await sb
    .from("campaigns")
    .select("id,name,status")
    .eq("company_id", empresa.id)
    .in("status", ["activa", "pausada"]) // no ofrecemos borradores: todavía no pudieron generar leads
    .order("name");
  return (data ?? []).map((c) => ({ id: c.id as string, nombre: c.name as string }));
}
