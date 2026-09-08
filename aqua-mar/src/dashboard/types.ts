/** Tipos del Dashboard Ejecutivo (Etapa 15). */
import type { Order, Customer, WholesaleLead, LeadStatus, OrderStatus } from "@/commerce/types";

export type Period = "hoy" | "mes" | "30d";

export type DashboardStats = {
  consultas: number | null;
  pedidos: number | null;
  mayoristas: number | null;
  clientesNuevos: number | null;
  conversion: number | null; // porcentaje 0-100
  whatsapps: number | null;
  productosConsultados: number | null;
  envios: number | null;
};

export type SeriesPoint = { label: string; value: number };
export type InquiriesPoint = { label: string; minoristas: number; mayoristas: number };

export type ProductStats = {
  productId: string;
  name: string;
  presentation: string;
  consultas: number | null;
};

export type CoveragePoint = { province: string; consultas: number };

export type ActivityItem = {
  id: string;
  when: string;
  text: string;
  kind: "pedido" | "consulta" | "mayorista" | "sistema";
};

export type OrderRow = Order & {
  customerName: string;
  product: string;
  presentation: string;
  province?: string;
};

export type CustomerRow = Customer & { lastOrder?: string; statusLabel: string };

export type AnalyticsStats = {
  connected: boolean;
  source: "ga4" | "meta" | "google_ads";
  metrics: SeriesPoint[];
};

export type DashboardData = {
  demo: boolean;
  stats: Record<Period, DashboardStats>;
  ventas: SeriesPoint[];
  consultas: InquiriesPoint[];
  productos: ProductStats[];
  cobertura: CoveragePoint[];
  funnel: SeriesPoint[];
  pedidos: OrderRow[];
  clientes: CustomerRow[];
  leads: WholesaleLead[];
  actividad: ActivityItem[];
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  presupuestado: "Presupuesto enviado",
  esperando_confirmacion: "Esperando confirmación",
  confirmado: "Pedido confirmado",
  preparando: "Preparando pedido",
  despachado: "Despachado",
  entregado: "Entregado",
  cancelado: "Cancelado",
  sin_respuesta: "Sin respuesta",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  calificado: "Calificado",
  informacion_enviada: "Información enviada",
  negociacion: "Negociación",
  cliente: "Cliente",
  seguimiento: "Seguimiento",
  no_interesado: "No interesado",
};

export const KANBAN_COLUMNS: LeadStatus[] = [
  "nuevo",
  "calificado",
  "negociacion",
  "cliente",
  "seguimiento",
];
