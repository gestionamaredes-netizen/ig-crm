export type Stage = { key: string; label: string; color: string };
export type Lead = { stage: string; name: string; desc: string; value: string; who: string };

export const funnelStages: Stage[] = [
  { key: "lead", label: "Lead", color: "#5b9dff" },
  { key: "contactado", label: "Contactado", color: "#7d7bf0" },
  { key: "reunion", label: "Reunión", color: "#B14BFF" },
  { key: "presupuesto", label: "Presupuesto", color: "#FF6B6B" },
  { key: "negociacion", label: "Negociación", color: "#FF9966" },
  { key: "cliente", label: "Cliente", color: "#4ade80" },
  { key: "postventa", label: "Postventa", color: "#2dd4bf" },
];

// Conteo del embudo combinado (dashboard global), estilo pirámide.
export const funnelSummary: { label: string; count: number; color: string }[] = [
  { label: "Leads", count: 356, color: "#5b9dff" },
  { label: "Contactados", count: 198, color: "#7d7bf0" },
  { label: "Reuniones", count: 89, color: "#B14BFF" },
  { label: "Propuestas", count: 54, color: "#FF6B6B" },
  { label: "Negociación", count: 23, color: "#FF9966" },
  { label: "Clientes", count: 12, color: "#2dd4bf" },
];

export const leadsByCompany: Record<string, Lead[]> = {
  nypro: [
    { stage: "lead", name: "Consulta iPhone 15", desc: "128GB stock/precio", value: "$1.1M", who: "JP" },
    { stage: "contactado", name: "Reserva notebook", desc: "Lenovo i5 — seña", value: "$950K", who: "MR" },
    { stage: "reunion", name: "Combo gamer corporativo", desc: "10 setups oficina", value: "$2.4M", who: "LT" },
    { stage: "presupuesto", name: "Mayorista accesorios", desc: "Fundas + cables x200", value: "$680K", who: "CG" },
    { stage: "negociacion", name: "Pedido AirPods x15", desc: "Revendedor", value: "$1.3M", who: "SA" },
    { stage: "cliente", name: "Pedido #1042", desc: "Powerful Pods x2", value: "$90K", who: "VE" },
    { stage: "postventa", name: "Cliente frecuente", desc: "Seguimiento garantía", value: "$140K", who: "DM" },
  ],
  gestiones: [
    { stage: "lead", name: "Cliente — compra USD", desc: "USD 3.000 blue", value: "$3.6M", who: "AR" },
    { stage: "contactado", name: "Cambio Euro", desc: "EUR 1.500", value: "$1.9M", who: "MB" },
    { stage: "reunion", name: "Empresa — venta oro", desc: "Onza + fracciones", value: "$4.2M", who: "EO" },
    { stage: "presupuesto", name: "Envío exterior", desc: "Transfer USDT", value: "$5.5M", who: "CE" },
    { stage: "negociacion", name: "Cartera mensual", desc: "Cliente corporativo", value: "$6.0M", who: "PP" },
    { stage: "cliente", name: "Operación USDT", desc: "Compra 4.000", value: "$4.9M", who: "US" },
    { stage: "postventa", name: "Cambio recurrente", desc: "Cliente mensual", value: "$2.0M", who: "RC" },
  ],
  premoldeados: [
    { stage: "lead", name: "Constructora del Sur", desc: "40 placas 6m", value: "$1.2M", who: "CS" },
    { stage: "contactado", name: "Vecino B° Norte", desc: "Muro perimetral", value: "$380K", who: "VN" },
    { stage: "reunion", name: "Loteo Las Lomas", desc: "Cordones cuneta", value: "$820K", who: "LL" },
    { stage: "presupuesto", name: "Municipalidad", desc: "Pavimento articulado", value: "$2.1M", who: "MU" },
    { stage: "negociacion", name: "Estudio Arq. Rossi", desc: "Viguetas + bloques", value: "$640K", who: "AR" },
    { stage: "cliente", name: "Obra Ruta 8", desc: "Alcantarillas H°", value: "$1.9M", who: "R8" },
  ],
  dollardrop: [
    { stage: "lead", name: "Interesado waitlist", desc: "Desde bio de IG", value: "—", who: "W1" },
    { stage: "contactado", name: "Beta tester", desc: "Probará la app", value: "—", who: "BT" },
  ],
  la80: [
    { stage: "cliente", name: "Campaña IG + SEO Local", desc: "Alta de cuenta, arranca agosto 2026", value: "—", who: "L80" },
  ],
};
