import type { Metadata } from "next";
import { businessConfig } from "./business";

export const seoConfig: Metadata = {
  metadataBase: new URL(businessConfig.siteUrl),
  title: {
    default: "Aqua Mar | Distribuidora Oficial Powerful",
    template: "%s | Aqua Mar",
  },
  description:
    "Distribuidora oficial de Powerful en Zona Oeste. Venta minorista, mayorista y envíos a todo el país.",
  keywords: [
    "Powerful",
    "Powerful Argentina",
    "Powerful Zona Oeste",
    "cápsulas para lavar ropa",
    "distribuidora de productos de limpieza",
    "productos de limpieza Zona Oeste",
    "venta mayorista de limpieza",
    "cápsulas de lavado",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Aqua Mar | Distribuidora Oficial Powerful",
    description:
      "Cápsulas de lavado Powerful 3 en 1. Minorista, mayorista y envíos a toda Argentina.",
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
      "Cápsulas de lavado Powerful 3 en 1. Minorista, mayorista y envíos a toda Argentina.",
    images: ["/og/aqua-mar-og.jpg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/branding/aqua-mar-logo.jpg" },
};
