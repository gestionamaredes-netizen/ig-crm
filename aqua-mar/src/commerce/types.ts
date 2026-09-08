/** Modelos operativos (Etapa 11). Preparados para conectar Supabase,
 * Google Sheets o un CRM más adelante; hoy no hay persistencia real. */

export type StockStatus = "disponible" | "consultar" | "sin_stock" | "proximamente";

export type OrderStatus =
  | "nuevo"
  | "contactado"
  | "presupuestado"
  | "esperando_confirmacion"
  | "confirmado"
  | "preparando"
  | "despachado"
  | "entregado"
  | "cancelado"
  | "sin_respuesta";

export type LeadStatus =
  | "nuevo"
  | "calificado"
  | "informacion_enviada"
  | "negociacion"
  | "cliente"
  | "seguimiento"
  | "no_interesado";

export type Product = {
  id: string;
  name: string;
  presentation: string;
  image: string;
  imagePosition?: string;
  shortDescription: string;
  active: boolean;
  retailAvailable: boolean;
  wholesaleAvailable: boolean;
  price: ProductPrice | null;
  stockStatus: StockStatus;
};

export type ProductPrice = {
  retail?: number | null;
  wholesaleFrom?: number | null;
  currency: "ARS";
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  city?: string;
  province?: string;
  type: "retail" | "wholesale";
  businessName?: string;
  notes?: string;
  createdAt: string;
};

export type Order = {
  id: string;
  customerId: string;
  status: OrderStatus;
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  deliveryMethod?: string;
  paymentMethod?: string;
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  presentation: string;
  quantity: number;
  unitPrice?: number;
};

export type WholesaleLead = {
  id: string;
  name: string;
  businessName?: string;
  phone: string;
  city?: string;
  province?: string;
  estimatedVolume?: string;
  status: LeadStatus;
  nextFollowUp?: string;
  notes?: string;
  createdAt: string;
};

export type FollowUp = {
  id: string;
  customerId: string;
  scheduledFor: string;
  done: boolean;
  notes?: string;
};

export const STOCK_LABELS: Record<StockStatus, string> = {
  disponible: "Disponible para pedidos",
  consultar: "Consultá disponibilidad",
  sin_stock: "Temporalmente sin stock",
  proximamente: "Próximamente disponible",
};
