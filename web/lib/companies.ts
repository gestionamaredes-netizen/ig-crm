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
    modules: ["Dashboard", "Mystery Box", "USDT", "Usuarios", "Transacciones", "Wallet", "Recompensas", "Analytics"],
  },
];

export function getCompany(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}
