import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, Sora } from "next/font/google";
import "./globals.css";

// next/font descarga y sirve las fuentes desde nuestro propio dominio: una
// petición externa menos y nada que bloquee el primer dibujado en el celular.
const sora = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--f-disp" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-body" });
const barlow = Barlow_Condensed({
  subsets: ["latin"], weight: ["600", "700"], variable: "--f-util",
});

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
    <html lang="es" className={`${sora.variable} ${inter.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
