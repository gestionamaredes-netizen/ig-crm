import type { Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { seoConfig } from "@/config/seo";
import { verification } from "@/config/analytics";
import { getStructuredData } from "@/lib/structured-data";
import { AnalyticsProviders } from "@/analytics/providers";
import { CookieBanner } from "@/components/consent/CookieBanner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata = {
  ...seoConfig,
  verification: {
    google: verification.google || undefined,
    other: verification.bing ? { "msvalidate.01": verification.bing } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#0058D9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
        />
        {children}
        <AnalyticsProviders />
        <CookieBanner />
      </body>
    </html>
  );
}
