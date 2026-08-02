"use client";

import Link from "next/link";
import { Megaphone, Search, Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { PanelCard, EmptyState } from "@/components/dashboard/widgets";

const CHANNELS = [
  {
    icon: InstagramIcon,
    name: "Instagram",
    state: "Activo",
    detail: "Kit de lanzamiento publicado. Calendario de 30 días en brand/13-plan-marketing.md.",
  },
  {
    icon: Megaphone,
    name: "Meta Ads",
    state: "Planificado",
    detail: "5 campañas definidas (reconocimiento, tráfico, mensajes, mayoristas, remarketing).",
  },
  {
    icon: Search,
    name: "Google Ads",
    state: "Planificado",
    detail: "Búsqueda por keywords de marca y categoría + Performance Max con fotos reales.",
  },
  {
    icon: Mail,
    name: "Email",
    state: "Futuro",
    detail: "Flujos preparados en el plan; requiere lista de contactos propia.",
  },
];

export default function MarketingPage() {
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">Marketing</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {CHANNELS.map((c) => (
          <PanelCard key={c.name} title={c.name}>
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 flex-none items-center justify-center rounded-xl bg-celeste/60 text-primary dark:bg-white/10 dark:text-turquesa">
                <c.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-turquesa">
                  {c.state}
                </p>
                <p className="mt-1 text-sm text-ink-soft dark:text-white/60">{c.detail}</p>
              </div>
            </div>
          </PanelCard>
        ))}
      </div>
      <PanelCard title="Rendimiento de campañas">
        <EmptyState text="Las métricas de campañas van a aparecer acá cuando Meta y Google estén conectados con sus IDs. Sin datos inventados." />
      </PanelCard>
      <p className="text-xs text-ink-soft dark:text-white/40">
        Plan completo:{" "}
        <Link href="/" className="font-bold text-primary">
          brand/13-plan-marketing.md
        </Link>{" "}
        en el repositorio.
      </p>
    </>
  );
}
