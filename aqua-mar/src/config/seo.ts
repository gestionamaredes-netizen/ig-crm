import type { Metadata } from "next";
import { businessConfig } from "./business";

export const seoConfig: Metadata = {
  metadataBase: new URL(businessConfig.siteUrl),
  title: {
    default: "Aqua Mar | Distribuidora Oficial Powerful",
    template: "%s | Aqua Mar",
  },
  description:
    "Distribuidora oficial de Powerful. Venta mayorista por bulto cerrado de 12 envases, en Zona Oeste y con envíos a todo el país.",
  keywords: [
    "Powerful",
    "Powerful Argentina",
    "Powerful por mayor",
    "Powerful Zona Oeste",
    "cápsulas para lavar ropa por mayor",
    "distribuidora mayorista de limpieza",
    "productos de limpieza Zona Oeste",
    "venta mayorista de limpieza",
    "cápsulas de lavado",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Aqua Mar | Distribuidora Oficial Powerful",
    description:
      "Cápsulas de lavado Powerful 3 en 1 por mayor. Bulto cerrado de 12 envases y envíos a toda la Argentina.",
    url: businessConfig.siteUrl,
    siteName: "Aqua Mar Distribuidora",
    locale: "es_AR",
    type: "website",
    images: [{ url: "/og/aqua-mar-og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aqua Mar | Distribuidora Oficial Powerful",
    description:
      "Cápsulas de lavado Powerful 3 en 1 por mayor. Bulto cerrado de 12 envases y envíos a toda la Argentina.",
    images: ["/og/aqua-mar-og.jpg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/branding/aqua-mar-logo.jpg" },
};
