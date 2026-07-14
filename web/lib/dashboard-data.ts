export const bigStats = [
  { label: "Clientes", value: "1.248", delta: "+18.6%", tone: "up" as const, icon: "users", color: "#7d7bf0" },
  { label: "Ventas", value: "$52.8M", delta: "+24.3%", tone: "up" as const, icon: "dollar", color: "#5b9dff" },
  { label: "Leads", value: "356", delta: "+12.7%", tone: "up" as const, icon: "chart", color: "#FF6B6B" },
  { label: "Conversión", value: "23.7%", delta: "+8.4%", tone: "up" as const, icon: "target", color: "#FF9966" },
  { label: "Tareas", value: "48", delta: "-5.3%", tone: "down" as const, icon: "check", color: "#2dd4bf" },
];

// Serie del resumen financiero (0..100 normalizado para el gráfico).
export const salesSeries = [22, 30, 26, 38, 34, 46, 42, 55, 50, 63, 58, 72, 68, 80, 88];
export const costSeries = [14, 16, 15, 20, 18, 24, 22, 28, 26, 32, 30, 36, 34, 40, 44];
export const financials = {
  ingresos: "$52.840.000",
  ingresosDelta: "+24.3%",
  costos: "$18.420.000",
  costosDelta: "-8.7%",
};

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
