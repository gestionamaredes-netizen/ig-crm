export type Company = {
  slug: string;
  name: string;
  category: string;
  init: string;
  logo: string;
  color: string;
  grad: string;
  status: "activo" | "desarrollo";
  statusLabel: string;
  stats: [string, string][];
  kpis: [string, string][];
  modules: string[];
};

export const companies: Company[] = [
  {
    slug: "premoldeados",
    name: "Premoldeados MA",
    category: "Construcción",
    init: "PM",
    logo: "/logos/premoldeados.jpg",
    color: "#B8955A",
    grad: "linear-gradient(140deg,#caa768,#7d6a3c)",
    status: "activo",
    statusLabel: "Activo",
    stats: [["8", "Leads"], ["$1.9M", "Ventas"]],
    kpis: [["8", "Leads activos"], ["5", "Presupuestos"], ["$1.9M", "Ventas mes"], ["$475K", "Ticket prom."]],
    modules: ["Dashboard", "Obras", "Presupuestos", "Clientes", "Pedidos", "Producción", "Entregas", "Cobros", "Calendario", "Fotos"],
  },
  {
    slug: "gestiones",
    name: "Gestiones MA",
    category: "Servicios financieros",
    init: "GM",
    logo: "/logos/gestiones.png",
    color: "#D9A84E",
    grad: "linear-gradient(140deg,#D9A84E,#a9791f)",
    status: "activo",
    statusLabel: "Activo",
    stats: [["24", "Clientes"], ["$8.2M", "Volumen"]],
    kpis: [["24", "Clientes activos"], ["63", "Operaciones mes"], ["$8.2M", "Volumen"], ["4.9★", "Reputación"]],
    modules: ["Dashboard", "Clientes", "Divisas", "Operaciones", "Documentación", "Importaciones", "Cobros", "Facturación", "Seguimiento", "IA Jurídica"],
  },
  {
    slug: "nypro",
    name: "NYPRO IMPORTS",
    category: "E-commerce · tecnología",
    init: "NY",
    logo: "/logos/nypro.png",
    color: "#3B82F6",
    grad: "linear-gradient(140deg,#3B82F6,#1e5fd0)",
    status: "activo",
    statusLabel: "Activo",
    stats: [["37", "Pedidos mes"], ["$0.9M", "Ventas"]],
    kpis: [["37", "Pedidos del mes"], ["11", "Consultas abiertas"], ["$0.9M", "Ventas mes"], ["3.1%", "Conversión"]],
    modules: ["Dashboard", "Productos", "Pedidos", "Clientes", "WhatsApp", "Meta Ads", "Facturación", "Stock", "Importaciones", "Reportes", "IA Comercial"],
  },
  {
    slug: "dollardrop",
    name: "Dollar Drop",
    category: "Cambio · cripto",
    init: "DD",
    logo: "/logos/dollardrop.png",
    color: "#2563EB",
    grad: "linear-gradient(140deg,#3b6fe0,#1c3d8f)",
    status: "desarrollo",
    statusLabel: "En desarrollo",
    stats: [["12", "Waitlist"], ["—", "Pre-launch"]],
    kpis: [["12", "Lista de espera"], ["0", "Operaciones"], ["—", "Ventas"], ["Ago '26", "Lanzamiento"]],
    modules: ["Dashboard", "Mystery Box", "USDT", "Usuarios", "Transacciones", "Wallet", "Recompensas", "Analytics"],
  },
];

export function getCompany(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}
