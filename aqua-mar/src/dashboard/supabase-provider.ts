"use client";

/**
 * Proveedor Supabase del panel: lee las tablas compartidas del equipo
 * y las convierte en DashboardData. Todos los números que muestra se
 * derivan de registros cargados por el equipo; lo que no se puede
 * derivar de la base (consultas web, conversión, WhatsApps) queda en
 * null y el panel muestra "—".
 */

import type { LeadStatus, OrderStatus, WholesaleLead } from "@/commerce/types";
import { products } from "@/data/products";
import { getSupabase } from "@/lib/supabase";
import { LEAD_STATUS_LABELS, type DashboardData, type DashboardStats } from "./types";

type ClienteRow = {
  id: string;
  nombre: string;
  telefono: string;
  ciudad: string | null;
  provincia: string | null;
  tipo: "retail" | "wholesale";
  empresa: string | null;
  notas: string | null;
  creado_en: string;
};

type PedidoRow = {
  id: string;
  cliente_id: string;
  producto: string;
  presentacion: string;
  cantidad: number | null;
  estado: OrderStatus;
  provincia: string | null;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
  clientes: { nombre: string } | null;
};

type ConsultaRow = {
  id: string;
  nombre: string;
  empresa: string | null;
  telefono: string;
  ciudad: string | null;
  provincia: string | null;
  volumen_estimado: string | null;
  estado: LeadStatus;
  proximo_seguimiento: string | null;
  notas: string | null;
  creado_en: string;
};

/* ------------------------------------------------------------------ */
/* Store compartido: una sola carga por sesión, varios hooks la usan.  */
/* ------------------------------------------------------------------ */

let cache: DashboardData | null = null;
let lastError: string | null = null;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function subscribeDashboard(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDashboardCache() {
  return { data: cache, error: lastError };
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function loadDashboard(force = false): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return Promise.resolve();
  if (cache && !force) return Promise.resolve();
  if (inflight) return inflight;

  inflight = (async () => {
    const [clientesRes, pedidosRes, consultasRes] = await Promise.all([
      supabase.from("clientes").select("*").order("creado_en", { ascending: false }),
      supabase
        .from("pedidos")
        .select("*, clientes(nombre)")
        .order("creado_en", { ascending: false }),
      supabase
        .from("consultas_mayoristas")
        .select("*")
        .order("creado_en", { ascending: false }),
    ]);
    const failed = clientesRes.error ?? pedidosRes.error ?? consultasRes.error;
    if (failed) {
      lastError =
        "No pudimos leer la base de datos. Revisá la conexión e intentá de nuevo.";
    } else {
      lastError = null;
      cache = buildDashboardData(
        (clientesRes.data ?? []) as ClienteRow[],
        (pedidosRes.data ?? []) as PedidoRow[],
        (consultasRes.data ?? []) as ConsultaRow[]
      );
    }
  })()
    .catch(() => {
      lastError =
        "No pudimos conectar con la base de datos. Revisá tu conexión a internet.";
    })
    .finally(() => {
      inflight = null;
      notify();
    });

  return inflight;
}

export function refreshDashboard(): Promise<void> {
  return loadDashboard(true);
}

/** Limpia la caché al cerrar sesión, para no mostrar datos al próximo usuario. */
export function clearDashboardCache() {
  cache = null;
  lastError = null;
  notify();
}

/* ------------------------------------------------------------------ */
/* Altas y cambios de estado                                           */
/* ------------------------------------------------------------------ */

type Resultado = { error: string | null };

const ERROR_GUARDAR =
  "No se pudo guardar. Revisá la conexión e intentá de nuevo.";

export async function crearCliente(input: {
  nombre: string;
  telefono: string;
  tipo: "retail" | "wholesale";
  ciudad?: string;
  provincia?: string;
  empresa?: string;
  notas?: string;
}): Promise<Resultado> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Base de datos no configurada." };
  const { error } = await supabase.from("clientes").insert({
    nombre: input.nombre.trim(),
    telefono: input.telefono.trim(),
    tipo: input.tipo,
    ciudad: input.ciudad?.trim() || null,
    provincia: input.provincia?.trim() || null,
    empresa: input.empresa?.trim() || null,
    notas: input.notas?.trim() || null,
  });
  if (error) return { error: ERROR_GUARDAR };
  await refreshDashboard();
  return { error: null };
}

export async function crearPedido(input: {
  clienteId: string;
  producto: string;
  presentacion: string;
  cantidad?: number;
  provincia?: string;
  notas?: string;
}): Promise<Resultado> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Base de datos no configurada." };
  const { error } = await supabase.from("pedidos").insert({
    cliente_id: input.clienteId,
    producto: input.producto,
    presentacion: input.presentacion,
    cantidad: input.cantidad ?? null,
    provincia: input.provincia?.trim() || null,
    notas: input.notas?.trim() || null,
  });
  if (error) return { error: ERROR_GUARDAR };
  await refreshDashboard();
  return { error: null };
}

export async function cambiarEstadoPedido(
  id: string,
  estado: OrderStatus
): Promise<Resultado> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Base de datos no configurada." };
  const { error } = await supabase.from("pedidos").update({ estado }).eq("id", id);
  if (error) return { error: ERROR_GUARDAR };
  await refreshDashboard();
  return { error: null };
}

export async function crearConsultaMayorista(input: {
  nombre: string;
  telefono: string;
  empresa?: string;
  ciudad?: string;
  provincia?: string;
  volumenEstimado?: string;
  notas?: string;
}): Promise<Resultado> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Base de datos no configurada." };
  const { error } = await supabase.from("consultas_mayoristas").insert({
    nombre: input.nombre.trim(),
    telefono: input.telefono.trim(),
    empresa: input.empresa?.trim() || null,
    ciudad: input.ciudad?.trim() || null,
    provincia: input.provincia?.trim() || null,
    volumen_estimado: input.volumenEstimado || null,
    notas: input.notas?.trim() || null,
  });
  if (error) return { error: ERROR_GUARDAR };
  await refreshDashboard();
  return { error: null };
}

export async function cambiarEstadoConsulta(
  id: string,
  estado: LeadStatus
): Promise<Resultado> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Base de datos no configurada." };
  const { error } = await supabase
    .from("consultas_mayoristas")
    .update({ estado })
    .eq("id", id);
  if (error) return { error: ERROR_GUARDAR };
  await refreshDashboard();
  return { error: null };
}

/* ------------------------------------------------------------------ */
/* Mapeo a DashboardData                                               */
/* ------------------------------------------------------------------ */

const DIA_MS = 24 * 60 * 60 * 1000;

function esMismoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function buildDashboardData(
  clientes: ClienteRow[],
  pedidos: PedidoRow[],
  consultas: ConsultaRow[]
): DashboardData {
  const ahora = new Date();

  const enPeriodo = (iso: string, periodo: "hoy" | "mes" | "30d") => {
    const fecha = new Date(iso);
    if (periodo === "hoy") return esMismoDia(fecha, ahora);
    if (periodo === "mes")
      return (
        fecha.getFullYear() === ahora.getFullYear() &&
        fecha.getMonth() === ahora.getMonth()
      );
    return ahora.getTime() - fecha.getTime() <= 30 * DIA_MS;
  };

  const statsDe = (periodo: "hoy" | "mes" | "30d"): DashboardStats => ({
    // Derivables de la base cargada por el equipo:
    pedidos: pedidos.filter((p) => enPeriodo(p.creado_en, periodo)).length,
    mayoristas: consultas.filter((c) => enPeriodo(c.creado_en, periodo)).length,
    clientesNuevos: clientes.filter((c) => enPeriodo(c.creado_en, periodo)).length,
    envios: pedidos.filter(
      (p) =>
        enPeriodo(p.creado_en, periodo) &&
        (p.estado === "despachado" || p.estado === "entregado")
    ).length,
    // Estos vienen de analítica web, no de la base: sin dato, "—".
    consultas: null,
    conversion: null,
    whatsapps: null,
    productosConsultados: null,
  });

  // Serie diaria de pedidos, últimos 30 días.
  const ventas =
    pedidos.length === 0
      ? []
      : Array.from({ length: 30 }, (_, i) => {
          const dia = new Date(ahora.getTime() - (29 - i) * DIA_MS);
          return {
            label: dia.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
            value: pedidos.filter((p) => esMismoDia(new Date(p.creado_en), dia)).length,
          };
        });

  // Registros por mes (últimos 6): pedidos vs consultas mayoristas.
  const consultasSerie =
    pedidos.length === 0 && consultas.length === 0
      ? []
      : Array.from({ length: 6 }, (_, i) => {
          const mes = new Date(ahora.getFullYear(), ahora.getMonth() - (5 - i), 1);
          const dentro = (iso: string) => {
            const f = new Date(iso);
            return (
              f.getFullYear() === mes.getFullYear() && f.getMonth() === mes.getMonth()
            );
          };
          return {
            label: mes.toLocaleDateString("es-AR", { month: "short" }),
            minoristas: pedidos.filter((p) => dentro(p.creado_en)).length,
            mayoristas: consultas.filter((c) => dentro(c.creado_en)).length,
          };
        });

  // Ranking por presentación, contando pedidos cargados.
  const productos = products.map((p) => ({
    productId: p.id,
    name: p.name,
    presentation: p.presentation,
    consultas:
      pedidos.length === 0
        ? null
        : pedidos.filter((x) => x.presentacion === p.presentation).length,
  }));

  // Cobertura: provincias de pedidos y consultas mayoristas.
  const porProvincia = new Map<string, number>();
  for (const provincia of [
    ...pedidos.map((p) => p.provincia),
    ...consultas.map((c) => c.provincia),
  ]) {
    if (!provincia) continue;
    porProvincia.set(provincia, (porProvincia.get(provincia) ?? 0) + 1);
  }
  const cobertura = Array.from(porProvincia.entries())
    .map(([province, cantidad]) => ({ province, consultas: cantidad }))
    .sort((a, b) => b.consultas - a.consultas)
    .slice(0, 8);

  // Embudo real del pipeline mayorista.
  const funnel =
    consultas.length === 0
      ? []
      : (["nuevo", "calificado", "negociacion", "cliente"] as LeadStatus[]).map(
          (estado) => ({
            label: LEAD_STATUS_LABELS[estado],
            value: consultas.filter((c) => c.estado === estado).length,
          })
        );

  const ultimoPedidoDe = new Map<string, string>();
  for (const p of pedidos) {
    if (!ultimoPedidoDe.has(p.cliente_id)) {
      ultimoPedidoDe.set(p.cliente_id, fechaCorta(p.creado_en));
    }
  }
  const pedidosDe = (clienteId: string) =>
    pedidos.filter((p) => p.cliente_id === clienteId).length;

  const leads: WholesaleLead[] = consultas.map((c) => ({
    id: c.id,
    name: c.nombre,
    businessName: c.empresa ?? undefined,
    phone: c.telefono,
    city: c.ciudad ?? undefined,
    province: c.provincia ?? undefined,
    estimatedVolume: c.volumen_estimado ?? undefined,
    status: c.estado,
    nextFollowUp: c.proximo_seguimiento ?? undefined,
    notes: c.notas ?? undefined,
    createdAt: c.creado_en,
  }));

  const actividad = [
    ...pedidos.map((p) => ({
      id: `pedido-${p.id}`,
      when: p.creado_en,
      text: `Pedido registrado: ${p.clientes?.nombre ?? "cliente"} · ${p.presentacion}`,
      kind: "pedido" as const,
    })),
    ...consultas.map((c) => ({
      id: `consulta-${c.id}`,
      when: c.creado_en,
      text: `Consulta mayorista: ${c.nombre}${c.empresa ? ` (${c.empresa})` : ""}`,
      kind: "mayorista" as const,
    })),
    ...clientes.map((c) => ({
      id: `cliente-${c.id}`,
      when: c.creado_en,
      text: `Cliente nuevo: ${c.nombre}`,
      kind: "sistema" as const,
    })),
  ]
    .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
    .slice(0, 6)
    .map((a) => ({
      ...a,
      when: new Date(a.when).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

  return {
    demo: false,
    stats: { hoy: statsDe("hoy"), mes: statsDe("mes"), "30d": statsDe("30d") },
    ventas,
    consultas: consultasSerie,
    productos,
    cobertura,
    funnel,
    pedidos: pedidos.map((p) => ({
      id: p.id,
      customerId: p.cliente_id,
      customerName: p.clientes?.nombre ?? "—",
      product: p.producto,
      presentation: p.presentacion,
      province: p.provincia ?? undefined,
      status: p.estado,
      createdAt: p.creado_en,
      updatedAt: p.actualizado_en,
    })),
    clientes: clientes.map((c) => ({
      id: c.id,
      name: c.nombre,
      phone: c.telefono,
      city: c.ciudad ?? undefined,
      province: c.provincia ?? undefined,
      type: c.tipo,
      businessName: c.empresa ?? undefined,
      notes: c.notas ?? undefined,
      createdAt: c.creado_en,
      lastOrder: ultimoPedidoDe.get(c.id),
      statusLabel:
        pedidosDe(c.id) > 0
          ? `${pedidosDe(c.id)} pedido${pedidosDe(c.id) === 1 ? "" : "s"}`
          : "Sin pedidos",
    })),
    leads,
    actividad,
  };
}
