import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { CookieSettings } from "@/components/consent/CookieSettings";

export const metadata: Metadata = {
  title: "Política de cookies",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies">
      <p>
        Usamos cookies para mejorar la experiencia y medir el rendimiento del
        sitio. Las cookies necesarias permiten el funcionamiento básico; las
        de analítica y marketing solo se activan con tu consentimiento y
        podés cambiarlo cuando quieras desde esta página.
      </p>
      <CookieSettings />
      <p className="rounded-2xl bg-mist p-4 text-sm">
        Este texto es una plantilla editable y no constituye asesoramiento
        legal. Debe ser revisado por un profesional antes de considerarse
        definitivo.
      </p>
    </LegalPage>
  );
}
