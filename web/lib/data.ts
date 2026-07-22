import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/funnel";

const stageNameToKey: Record<string, string> = {
  Lead: "lead",
  Contactado: "contactado",
  Reunión: "reunion",
  Presupuesto: "presupuesto",
  Negociación: "negociacion",
  Cliente: "cliente",
  Postventa: "postventa",
};

export function formatValue(n: number): string {
  if (!n || n <= 0) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "··";
}

type LeadRow = {
  id: string;
  name: string;
  description: string;
  value: number | string;
  channel: string;
  stages: { name: string } | { name: string }[] | null;
};

export async function getLeadsBySlug(slug: string): Promise<Lead[]> {
  const sb = await createClient();
  const { data: company } = await sb.from("companies").select("id").eq("slug", slug).single();
  if (!company) return [];
  const { data } = await sb
    .from("leads")
    .select("id,name,description,value,channel,stages(name)")
    .eq("company_id", company.id)
    .order("value", { ascending: false });
  return (data ?? []).map((r: LeadRow) => {
    const st = Array.isArray(r.stages) ? r.stages[0] : r.stages;
    const stageName = st?.name ?? "Lead";
    return {
      stage: stageNameToKey[stageName] ?? "lead",
      name: r.name,
      desc: r.description,
      value: formatValue(Number(r.value)),
      who: initials(r.name),
    };
  });
}

export async function getFunnelSummary() {
  const sb = await createClient();
  const { data } = await sb.from("leads").select("value,stages(name)");
  const order = ["Lead", "Contactado", "Reunión", "Presupuesto", "Negociación", "Cliente"];
  const colors: Record<string, string> = {
    Lead: "#5b9dff",
    Contactado: "#7d7bf0",
    Reunión: "#B14BFF",
    Presupuesto: "#FF6B6B",
    Negociación: "#FF9966",
    Cliente: "#2dd4bf",
  };
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const st = Array.isArray(row.stages) ? row.stages[0] : row.stages;
    const name = (st as { name: string } | null)?.name;
    if (name && name in colors) counts[name] = (counts[name] ?? 0) + 1;
  }
  const labelMap: Record<string, string> = {
    Lead: "Leads",
    Contactado: "Contactados",
    Reunión: "Reuniones",
    Presupuesto: "Propuestas",
    Negociación: "Negociación",
    Cliente: "Clientes",
  };
  return order.map((k) => ({ label: labelMap[k], count: counts[k] ?? 0, color: colors[k] }));
}

export async function getTasks() {
  const sb = await createClient();
  const { data } = await sb.from("tasks").select("title,priority,done,companies(name)").order("priority");
  return (data ?? []).map((t) => {
    const c = Array.isArray(t.companies) ? t.companies[0] : t.companies;
    return { title: t.title as string, company: (c as { name: string } | null)?.name ?? "", priority: t.priority as "Alta" | "Media" | "Baja", done: t.done as boolean };
  });
}

export async function getActivity() {
  const sb = await createClient();
  const { data } = await sb.from("activity").select("text,created_at,companies(name)").order("created_at", { ascending: false }).limit(6);
  return (data ?? []).map((a) => {
    const c = Array.isArray(a.companies) ? a.companies[0] : a.companies;
    return { text: a.text as string, company: (c as { name: string } | null)?.name ?? "" };
  });
}

/**
 * Cifras de cabecera calculadas desde la base. Reemplaza los números de
 * demostración que estaban hardcodeados: mostrar ventas inventadas en un panel
 * que se lee de un vistazo es peor que no mostrar nada.
 *
 * No hay comparación contra el mes anterior porque no guardamos histórico
 * todavía; preferimos omitir el dato antes que estimarlo.
 */
export async function getResumenGeneral() {
  const sb = await createClient();
  const [{ data: leads }, { data: tasks }] = await Promise.all([
    sb.from("leads").select("value,stages(name)"),
    sb.from("tasks").select("done"),
  ]);

  const filas = leads ?? [];
  const esCliente = (row: (typeof filas)[number]) => {
    const st = Array.isArray(row.stages) ? row.stages[0] : row.stages;
    return (st as { name: string } | null)?.name === "Cliente";
  };

  const clientes = filas.filter(esCliente);
  const ventas = clientes.reduce((s, r) => s + Number(r.value ?? 0), 0);

  return {
    clientes: clientes.length,
    ventas,
    leads: filas.length,
    conversion: filas.length > 0 ? clientes.length / filas.length : null,
    tareas: (tasks ?? []).filter((t) => !t.done).length,
  };
}

/**
 * KPIs de una empresa, calculados desde la base. Reemplazan los valores fijos
 * que había en `lib/companies.ts`, que además se contradecían con el embudo
 * mostrado justo debajo en la misma pantalla.
 */
export async function getKpisEmpresa(slug: string): Promise<[string, string][]> {
  const sb = await createClient();
  const { data: empresa } = await sb.from("companies").select("id").eq("slug", slug).single();
  if (!empresa) return [];

  const { data } = await sb.from("leads").select("value,stages(name)").eq("company_id", empresa.id);
  const filas = data ?? [];
  const etapa = (row: (typeof filas)[number]) => {
    const st = Array.isArray(row.stages) ? row.stages[0] : row.stages;
    return (st as { name: string } | null)?.name ?? "";
  };

  const clientes = filas.filter((r) => etapa(r) === "Cliente");
  const ventas = clientes.reduce((s, r) => s + Number(r.value ?? 0), 0);
  // "Activos" = todavía en juego: ni cerrados como clientes ni en postventa.
  const activos = filas.filter((r) => !["Cliente", "Postventa"].includes(etapa(r)));
  const presupuestos = filas.filter((r) => etapa(r) === "Presupuesto");
  const ticket = clientes.length > 0 ? Math.round(ventas / clientes.length) : 0;

  return [
    [String(activos.length), "Leads activos"],
    [String(presupuestos.length), "Presupuestos"],
    [formatValue(ventas), "Vendido"],
    [clientes.length > 0 ? formatValue(ticket) : "—", "Ticket prom."],
  ];
}

export async function getStageOptions(slug: string) {
  const sb = await createClient();
  const { data: company } = await sb.from("companies").select("id").eq("slug", slug).single();
  if (!company) return [];
  const { data } = await sb.from("stages").select("id,name,\"order\"").eq("company_id", company.id).order("order");
  return (data ?? []).map((s) => ({ id: s.id as string, name: s.name as string }));
}
