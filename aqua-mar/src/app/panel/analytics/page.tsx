"use client";

import { analyticsConfig } from "@/config/analytics";
import { PanelCard, EmptyState, StatusBadge } from "@/components/dashboard/widgets";

const SOURCES = [
  {
    name: "Google Analytics 4",
    id: analyticsConfig.googleAnalyticsId,
    envVar: "NEXT_PUBLIC_GA_ID",
    detail: "Usuarios, sesiones, fuentes de tráfico y conversiones de la web.",
  },
  {
    name: "Google Tag Manager",
    id: analyticsConfig.googleTagManagerId,
    envVar: "NEXT_PUBLIC_GTM_ID",
    detail: "Gestión centralizada de etiquetas y eventos.",
  },
  {
    name: "Meta Pixel",
    id: analyticsConfig.metaPixelId,
    envVar: "NEXT_PUBLIC_META_PIXEL_ID",
    detail: "Medición de campañas de Instagram y Facebook, remarketing.",
  },
  {
    name: "Google Ads",
    id: analyticsConfig.googleAdsId,
    envVar: "NEXT_PUBLIC_GOOGLE_ADS_ID",
    detail: "Conversiones de búsqueda y Performance Max: CTR y costo.",
  },
];

export default function AnalyticsPage() {
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {SOURCES.map((s) => (
          <PanelCard
            key={s.name}
            title={s.name}
            action={
              <StatusBadge
                label={s.id ? "Conectado" : "Sin conectar"}
                tone={s.id ? "green" : "gray"}
              />
            }
          >
            <p className="mb-4 text-sm text-ink-soft dark:text-white/50">{s.detail}</p>
            {s.id ? (
              <EmptyState
                compact
                title="Recopilando datos"
                text="Los reportes se consultan en la plataforma de origen; este panel mostrará los widgets cuando se conecte una API de lectura."
              />
            ) : (
              <EmptyState
                compact
                text={`Cargar ${s.envVar} en las variables de entorno de Netlify para activarlo.`}
              />
            )}
          </PanelCard>
        ))}
      </div>
      <p className="text-xs text-ink-soft dark:text-white/40">
        Los eventos ya se emiten desde la web (whatsapp_click,
        wholesale_form_submit, order_whatsapp_click y más) y llegan a estas
        herramientas apenas se configuren los IDs.
      </p>
    </>
  );
}
