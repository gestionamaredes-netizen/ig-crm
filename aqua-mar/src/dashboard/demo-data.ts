/**
 * DATOS DE DEMOSTRACIÓN — no son ventas ni métricas reales.
 * Solo existen para previsualizar el layout del panel. Se activan con el
 * interruptor "Modo demo" y siempre se muestran con la etiqueta DEMO.
 */
import type { DashboardData } from "./types";

const dias = ["L", "M", "X", "J", "V", "S", "D"];

export const demoData: DashboardData = {
  demo: true,
  stats: {
    hoy: {
      consultas: 6, pedidos: 2, mayoristas: 1, clientesNuevos: 3,
      conversion: 33, whatsapps: 9, productosConsultados: 5, envios: 1,
    },
    mes: {
      consultas: 84, pedidos: 31, mayoristas: 7, clientesNuevos: 26,
      conversion: 37, whatsapps: 120, productosConsultados: 64, envios: 22,
    },
    "30d": {
      consultas: 92, pedidos: 34, mayoristas: 8, clientesNuevos: 29,
      conversion: 36, whatsapps: 131, productosConsultados: 71, envios: 25,
    },
  },
  ventas: Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1}`,
    value: [3, 5, 2, 6, 4, 7, 5, 4, 6, 8, 5, 7, 6, 9, 7, 5, 8, 6, 7, 9, 8, 6, 9, 7, 8, 10, 8, 9, 11, 9][i],
  })),
  consultas: dias.map((d, i) => ({
    label: d,
    minoristas: [8, 11, 9, 12, 14, 10, 6][i],
    mayoristas: [2, 1, 3, 2, 4, 2, 1][i],
  })),
  productos: [
    { productId: "powerful-40", name: "Powerful 3 en 1", presentation: "40 cápsulas", consultas: 58 },
    { productId: "powerful-20", name: "Powerful 3 en 1", presentation: "20 cápsulas", consultas: 34 },
  ],
  cobertura: [
    { province: "Buenos Aires", consultas: 61 },
    { province: "CABA", consultas: 12 },
    { province: "Córdoba", consultas: 8 },
    { province: "Santa Fe", consultas: 6 },
    { province: "Mendoza", consultas: 5 },
  ],
  funnel: [
    { label: "Visitas", value: 1240 },
    { label: "WhatsApp", value: 131 },
    { label: "Presupuesto", value: 58 },
    { label: "Venta", value: 34 },
    { label: "Entrega", value: 25 },
  ],
  pedidos: [
    { id: "P-0034", customerId: "C-21", customerName: "Cliente demo 1", product: "Powerful 3 en 1", presentation: "40 cápsulas", status: "despachado", province: "Buenos Aires", createdAt: "", updatedAt: "" },
    { id: "P-0033", customerId: "C-20", customerName: "Cliente demo 2", product: "Powerful 3 en 1", presentation: "20 cápsulas", status: "confirmado", province: "Córdoba", createdAt: "", updatedAt: "" },
    { id: "P-0032", customerId: "C-19", customerName: "Cliente demo 3", product: "Powerful 3 en 1", presentation: "40 cápsulas", status: "presupuestado", province: "Buenos Aires", createdAt: "", updatedAt: "" },
    { id: "P-0031", customerId: "C-18", customerName: "Comercio demo", product: "Powerful 3 en 1", presentation: "40 cápsulas", status: "entregado", province: "Santa Fe", createdAt: "", updatedAt: "" },
  ],
  clientes: [
    { id: "C-21", name: "Cliente demo 1", phone: "—", city: "Morón", province: "Buenos Aires", type: "retail", statusLabel: "Activo", lastOrder: "P-0034", createdAt: "" },
    { id: "C-18", name: "Comercio demo", phone: "—", city: "Rosario", province: "Santa Fe", type: "wholesale", businessName: "Almacén demo", statusLabel: "Cliente frecuente", lastOrder: "P-0031", createdAt: "" },
  ],
  leads: [
    { id: "L-08", name: "Contacto demo 1", businessName: "Perfumería demo", phone: "—", province: "Buenos Aires", estimatedVolume: "13 a 24 unidades", status: "nuevo", createdAt: "" },
    { id: "L-07", name: "Contacto demo 2", businessName: "Autoservicio demo", phone: "—", province: "CABA", estimatedVolume: "25 a 50 unidades", status: "negociacion", createdAt: "" },
    { id: "L-05", name: "Contacto demo 3", businessName: "Distribuidora demo", phone: "—", province: "Córdoba", estimatedVolume: "Más de 50 unidades", status: "cliente", createdAt: "" },
  ],
  actividad: [
    { id: "a1", when: "hace 2 h", text: "Nueva consulta minorista por Powerful 40", kind: "consulta" },
    { id: "a2", when: "hace 5 h", text: "Pedido P-0034 despachado a Buenos Aires", kind: "pedido" },
    { id: "a3", when: "ayer", text: "Lead mayorista pasó a negociación", kind: "mayorista" },
  ],
};
