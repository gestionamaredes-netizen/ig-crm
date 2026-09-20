import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prospectos · Nexo Studios",
  description: "Prospección de sponsors en General San Martín.",
  manifest: "/manifest.webmanifest",
  // Acá vive el ícono del acceso directo: al ser esta la página de afuera,
  // el teléfono sí lo toma (dentro de un artifact de claude.ai no podía).
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Nexo",
    statusBarStyle: "black-translucent",
  },
  // Es una herramienta interna: no tiene por qué aparecer en buscadores.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#05070B",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
