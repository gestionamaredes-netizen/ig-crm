"use client";

import { useState } from "react";
import {
  MessageCircle,
  ShoppingBag,
  Boxes,
  UserPlus,
  Percent,
  Send,
  Package,
  Truck,
} from "lucide-react";
import { useDashboardData } from "@/dashboard/service";
import type { Period } from "@/dashboard/types";
import { StatCard, PanelCard, EmptyState, StatusBadge } from "@/components/dashboard/widgets";
import { SalesAreaChart, InquiriesBarChart, ShareDonut, FunnelList } from "@/components/dashboard/charts";
import { ArgentinaMap } from "@/components/ui/ArgentinaMap";
import { ORDER_STATUS_LABELS } from "@/dashboard/types";

const PERIODS: { id: Period; label: string }[] = [
  { id: "hoy", label: "Hoy" },
  { id: "mes", label: "Este mes" },
  { id: "30d", label: "Últimos 30 días" },
];

export default function PanelHome() {
  const { data } = useDashboardData();
  const [period, setPeriod] = useState<Period>("30d");
  const s = data.stats[period];

  const kpis = [
    { label: "Consultas", value: s.consultas, icon: MessageCircle },
    { label: "Pedidos", value: s.pedidos, icon: ShoppingBag },
    { label: "Mayoristas", value: s.mayoristas, icon: Boxes },
    { label: "Clientes nuevos", value: s.clientesNuevos, icon: UserPlus },
    { label: "Conversión", value: s.conversion, suffix: "%", icon: Percent },
    { label: "WhatsApps", value: s.whatsapps, icon: Send },
    { label: "Prod. consultados", value: s.productosConsultados, icon: Package },
    { label: "Envíos", value: s.envios, icon: Truck },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">
          Dashboard
        </h1>
        <div className="flex rounded-2xl border border-border bg-white p-1 dark:border-white/10 dark:bg-white/5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              aria-pressed={period === p.id}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                period === p.id
                  ? "bg-primary text-white"
                  : "text-ink-soft hover:bg-mist dark:text-white/60"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <PanelCard title="Pedidos · últimos 30 días" className="lg:col-span-3">
          <SalesAreaChart data={data.ventas} />
        </PanelCard>
        <PanelCard title="Minoristas vs. mayoristas" className="lg:col-span-2">
          <InquiriesBarChart data={data.consultas} />
        </PanelCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PanelCard title="Ranking de productos">
          <ShareDonut
            data={data.productos.map((p) => ({
              label: p.presentation,
              value: p.consultas ?? 0,
            }))}
          />
          <ul className="mt-2 grid gap-1.5">
            {data.productos.map((p) => (
              <li key={p.productId} className="flex justify-between text-sm">
                <span className="font-semibold text-ink dark:text-white/85">
                  {p.name} · {p.presentation}
                </span>
                <span className="tabular-nums text-ink-soft dark:text-white/50">
                  {p.consultas === null ? "—" : `${p.consultas} registros`}
                </span>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Cobertura · consultas por provincia">
          {data.cobertura.length === 0 ? (
            <div className="grid place-items-center gap-2">
              <ArgentinaMap className="h-48 w-auto opacity-60" />
              <p className="text-xs text-ink-soft dark:text-white/50">Sin datos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr] items-center gap-4">
              <ArgentinaMap className="h-48 w-auto" />
              <ul className="grid gap-1.5 text-sm">
                {data.cobertura.map((c) => (
                  <li key={c.province} className="flex justify-between gap-3">
                    <span className="font-semibold text-ink dark:text-white/85">{c.province}</span>
                    <span className="tabular-nums text-ink-soft dark:text-white/50">{c.consultas}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </PanelCard>

        <PanelCard title="Embudo comercial">
          <FunnelList data={data.funnel} />
        </PanelCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Pedidos recientes">
          {data.pedidos.length === 0 ? (
            <EmptyState compact text="Los pedidos que registres van a aparecer acá." />
          ) : (
            <ul className="grid gap-2">
              {data.pedidos.slice(0, 4).map((o) => (
                <li
                  key={o.id}
                  className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 overflow-hidden rounded-2xl border border-border px-4 py-3 text-sm dark:border-white/10"
                >
                  <span className="font-bold text-ink dark:text-white/90">{o.id}</span>
                  <span className="min-w-0 flex-1 truncate text-ink-soft dark:text-white/50">
                    {o.customerName} · {o.presentation}
                  </span>
                  <StatusBadge
                    label={ORDER_STATUS_LABELS[o.status]}
                    tone={o.status === "entregado" ? "green" : o.status === "despachado" ? "blue" : "amber"}
                  />
                </li>
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard title="Actividad">
          {data.actividad.length === 0 ? (
            <EmptyState compact text="Todavía no hay actividad registrada." />
          ) : (
            <ul className="grid gap-3">
              {data.actividad.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-2 flex-none rounded-full bg-turquesa" />
                  <div>
                    <p className="font-semibold text-ink dark:text-white/90">{a.text}</p>
                    <p className="text-xs text-ink-soft dark:text-white/45">{a.when}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </div>
    </>
  );
}
