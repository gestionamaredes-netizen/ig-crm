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

const TITULO = "Prospectos · Nexo Studios";
const BAJADA =
  "Listado para buscar sponsors en General San Martín. El seguimiento de cada " +
  "negocio, compartido por todo el equipo.";

// Netlify expone la URL del sitio al compilar. Sin esta base, Next resuelve
// "/og.png" contra localhost y la vista previa del link llega vacía.
const BASE =
  process.env.URL ??
  process.env.DEPLOY_PRIME_URL ??
  "https://nexo-prospectos.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: TITULO,
  description: BAJADA,
  manifest: "/manifest.webmanifest",
  // Lo que se ve cuando alguien pega el link en WhatsApp o lo manda por mail.
  // Sin esto el mensaje muestra sólo la dirección pelada.
  openGraph: {
    type: "website",
    siteName: "Nexo Studios",
    title: "Prospectos · Nexo Studios",
    description: BAJADA,
    locale: "es_AR",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Prospectos · Nexo Studios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: BAJADA,
    images: ["/og.png"],
  },
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
