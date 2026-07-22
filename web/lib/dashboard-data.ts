// Las cifras de cabecera y el resumen financiero ya no viven acá: se calculan
// desde la base en getResumenGeneral() (lib/data.ts). Los números de demostración
// —1.248 clientes, $52.8M en ventas, el gráfico financiero— se borraron el
// 22/07/2026 porque se leían como reales.
//
// Lo que queda es semilla para poblar la base con `npm run db:seed`, no datos
// que el dashboard muestre directamente.

export const activity = [
  { init: "NI", color: "#3B82F6", title: "Nueva venta en NYPRO IMPORTS", meta: "$ 1.280.000", when: "Hace 15 min" },
  { init: "PM", color: "#B8955A", title: "Presupuesto enviado en Premoldeados MA", meta: "$ 4.750.000", when: "Hace 1 hora" },
  { init: "GM", color: "#D9A84E", title: "Nuevo cliente en Gestiones MA", meta: "Juan Pérez", when: "Hace 2 horas" },
  { init: "DD", color: "#2563EB", title: "Pago recibido en Dollar Drop", meta: "150 USDT", when: "Hace 3 horas" },
  { init: "NI", color: "#B14BFF", title: "Campaña publicada en NYPRO", meta: "Meta Ads · Julio", when: "Hace 5 horas" },
];

export const tasks = [
  { title: "Responder 12 mensajes", company: "NYPRO IMPORTS", priority: "Alta" as const },
  { title: "Enviar presupuesto", company: "Premoldeados MA", priority: "Alta" as const },
  { title: "Reunión con cliente", company: "Gestiones MA", priority: "Media" as const },
  { title: "Revisar campaña Meta Ads", company: "NYPRO IMPORTS", priority: "Media" as const },
  { title: "Seguimiento Dollar Drop", company: "Dollar Drop", priority: "Baja" as const },
];

export const integrations = [
  { name: "WhatsApp Business", color: "#25D366", connected: true },
  { name: "Instagram", color: "#E1306C", connected: true },
  { name: "Meta Ads", color: "#1877F2", connected: true },
  { name: "Google Drive", color: "#4285F4", connected: true },
  { name: "Gmail", color: "#EA4335", connected: true },
  { name: "Claude AI", color: "#D97757", connected: true },
];
