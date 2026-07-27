import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { parseEmailList } from "@/lib/auth-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Mismo código, dos deploys: si este otorga acceso completo (NEXT_PUBLIC_FULL_ACCESS
// no vacío) es el CRM; si no, es la caja de cambio. El título de la pestaña se
// adapta para que el CRM no muestre "Caja de cambio".
const ES_CRM = parseEmailList(process.env.NEXT_PUBLIC_FULL_ACCESS).length > 0;

export const metadata: Metadata = ES_CRM
  ? {
      title: "IG CRM · Iniciativa Global",
      description: "Centro de operaciones de Iniciativa Global",
    }
  : {
      title: "Gestiones MA · Caja de cambio",
      description: "Compra y venta de dólares — Gestiones MA",
    };

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
