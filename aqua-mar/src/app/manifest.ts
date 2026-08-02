import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aqua Mar | Distribuidora Oficial Powerful",
    short_name: "Aqua Mar",
    description:
      "Distribuidora oficial de Powerful en Zona Oeste. Venta minorista, mayorista y envíos a todo el país.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6FAFD",
    theme_color: "#0058D9",
    icons: [
      { src: "/branding/aqua-mar-logo.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
  };
}
