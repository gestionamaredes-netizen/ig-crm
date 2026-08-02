"use client";

import { useState } from "react";
import { businessConfig, localSeo } from "@/config/business";
import { commerceConfig } from "@/config/commerce";
import { analyticsConfig } from "@/config/analytics";
import { dashboardConfig } from "@/config/dashboard";
import { isSupabaseConfigured } from "@/config/supabase";
import { products } from "@/data/products";
import { PanelCard, StatusBadge } from "@/components/dashboard/widgets";

const TABS = ["Empresa", "SEO", "WhatsApp", "Analytics", "Base de datos", "Cobertura", "Productos", "Usuarios"] as const;

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-border py-2.5 text-sm last:border-0 dark:border-white/10">
      <span className="font-bold text-ink dark:text-white/85">{k}</span>
      <span className="text-ink-soft dark:text-white/55">{v || "—"}</span>
    </div>
  );
}

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Empresa");

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">
        Configuración
      </h1>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
              tab === t
                ? "bg-primary text-white"
                : "bg-white text-ink-soft hover:bg-mist dark:bg-white/5 dark:text-white/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <PanelCard>
        {tab === "Empresa" && (
          <>
            <Row k="Nombre" v={businessConfig.name} />
            <Row k="Descriptor" v={businessConfig.descriptor} />
            <Row k="Claim" v={businessConfig.claim} />
            <Row k="Email" v={businessConfig.email} />
            <Row k="Dirección" v={businessConfig.address} />
            <p className="mt-4 text-xs text-ink-soft dark:text-white/40">
              Se edita en <code>src/config/business.ts</code>.
            </p>
          </>
        )}
        {tab === "SEO" && (
          <>
            <Row k="Dominio" v={businessConfig.siteUrl} />
            <Row k="Área de servicio" v={localSeo.serviceArea} />
            <Row k="Dirección física" v={localSeo.physicalAddress || "No confirmada (no se publica)"} />
            <Row k="Verificación Google" v={analyticsConfig.googleAnalyticsId ? "configurada" : "pendiente"} />
          </>
        )}
        {tab === "WhatsApp" && (
          <>
            <Row k="Número" v={businessConfig.whatsappDisplay} />
            <Row k="Variable" v="NEXT_PUBLIC_WHATSAPP_NUMBER" />
            <p className="mt-4 text-xs text-ink-soft dark:text-white/40">
              Todos los botones y formularios usan este número desde la
              configuración central.
            </p>
          </>
        )}
        {tab === "Analytics" && (
          <>
            <Row k="GA4" v={analyticsConfig.googleAnalyticsId || "sin conectar"} />
            <Row k="GTM" v={analyticsConfig.googleTagManagerId || "sin conectar"} />
            <Row k="Meta Pixel" v={analyticsConfig.metaPixelId || "sin conectar"} />
            <Row k="Google Ads" v={analyticsConfig.googleAdsId || "sin conectar"} />
          </>
        )}
        {tab === "Base de datos" && (
          <>
            <Row k="Supabase" v={isSupabaseConfigured ? "conectada" : "sin conectar"} />
            <Row k="Variables" v="NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY" />
            <p className="mt-4 text-xs text-ink-soft dark:text-white/40">
              {isSupabaseConfigured
                ? "Los pedidos, clientes y consultas que cargues quedan guardados en la base compartida: todo el equipo ve lo mismo."
                : "Guía paso a paso para conectarla: docs/SUPABASE.md del proyecto."}
            </p>
          </>
        )}
        {tab === "Cobertura" && (
          <>
            <Row k="Local" v={businessConfig.coverage.local} />
            <Row k="Nacional" v={businessConfig.coverage.national} />
            <Row k="País" v={localSeo.country} />
          </>
        )}
        {tab === "Productos" && (
          <>
            {products.map((p) => (
              <Row
                key={p.id}
                k={`${p.name} · ${p.presentation}`}
                v={`${p.active ? "activo" : "inactivo"} · precio ${p.price ? "cargado" : "a consultar"}`}
              />
            ))}
            <p className="mt-4 text-xs text-ink-soft dark:text-white/40">
              Se editan en <code>src/data/products.ts</code>.
            </p>
          </>
        )}
        {tab === "Usuarios" && (
          <>
            <p className="mb-3 text-sm text-ink-soft dark:text-white/55">
              {isSupabaseConfigured
                ? "Cada persona del equipo entra con su propia cuenta. Las cuentas se crean y se dan de baja desde Supabase → Authentication → Users."
                : "Roles previstos para cuando se conecte autenticación:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {dashboardConfig.roles.map((r) => (
                <StatusBadge key={r} label={r} tone="blue" />
              ))}
            </div>
            <p className="mt-4 text-xs text-ink-soft dark:text-white/40">
              {isSupabaseConfigured
                ? "Los roles todavía son informativos: hoy toda cuenta del equipo tiene el mismo acceso al panel."
                : "El panel debe protegerse (contraseña de Netlify o login propio) antes de conectar datos reales."}
            </p>
          </>
        )}
      </PanelCard>
    </>
  );
}
