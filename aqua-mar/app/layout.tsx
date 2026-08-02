import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { business } from "@/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: "Aqua Mar | Distribuidora Oficial Powerful",
  description:
    "Distribuidora oficial de Powerful en Zona Oeste. Venta minorista, mayorista y envíos a todo el país.",
  keywords: [
    "Powerful",
    "Powerful Argentina",
    "Powerful Zona Oeste",
    "cápsulas para lavar ropa",
    "productos de limpieza",
    "distribuidora Powerful",
    "lavado de ropa",
    "detergente cápsulas",
    "envíos a todo el país",
  ],
  openGraph: {
    title: "Aqua Mar | Distribuidora Oficial Powerful",
    description:
      "Cápsulas de lavado Powerful 3 en 1. Minorista, mayorista y envíos a toda Argentina.",
    url: business.siteUrl,
    siteName: "Aqua Mar Distribuidora",
    locale: "es_AR",
    type: "website",
    images: [{ url: "/img/powerful-pods-envase.jpg", width: 1200, height: 1600 }],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/img/logo-aqua-mar.jpg" },
};

export const viewport: Viewport = {
  themeColor: "#004EA8",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Aqua Mar Distribuidora",
  description:
    "Distribuidora oficial de Powerful en Zona Oeste. Venta minorista, mayorista y envíos a todo el país.",
  url: business.siteUrl,
  telephone: `+${business.whatsapp}`,
  email: business.email,
  areaServed: ["Zona Oeste, Buenos Aires", "Argentina"],
  address: {
    "@type": "PostalAddress",
    addressRegion: "Buenos Aires",
    addressCountry: "AR",
  },
  sameAs: [business.socialLinks.instagram],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
