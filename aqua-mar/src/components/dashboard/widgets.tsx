"use client";

import type { ReactNode, ComponentType } from "react";
import { Inbox } from "lucide-react";

/** Card base del panel. */
export function PanelCard({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-3xl border border-border bg-white p-6 shadow-xs dark:border-white/10 dark:bg-white/5 ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h3 className="font-display text-[15px] font-extrabold text-ink dark:text-white">
              {title}
            </h3>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** KPI: valor grande + etiqueta. Muestra "—" cuando no hay dato. */
export function StatCard({
  label,
  value,
  suffix = "",
  icon: Icon,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="min-w-0 rounded-3xl border border-border bg-white p-5 shadow-xs dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-soft dark:text-white/50">
          {label}
        </p>
        <span className="inline-flex size-9 flex-none items-center justify-center rounded-xl bg-celeste/60 text-primary dark:bg-white/10 dark:text-turquesa">
          <Icon className="size-4.5" strokeWidth={2} />
        </span>
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-ink dark:text-white">
        {value === null ? "—" : `${value.toLocaleString("es-AR")}${suffix}`}
      </p>
      {value === null && (
        <p className="mt-1 text-[11px] font-medium text-ink-soft/70 dark:text-white/40">
          Sin datos disponibles
        </p>
      )}
    </div>
  );
}

/** Estado vacío elegante y reutilizable. */
export function EmptyState({
  title = "Sin datos disponibles",
  text,
  compact = false,
}: {
  title?: string;
  text?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-mist/50 text-center dark:border-white/10 dark:bg-white/5 ${
        compact ? "p-6" : "p-12"
      }`}
    >
      <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white text-ink-soft shadow-xs dark:bg-white/10 dark:text-white/60">
        <Inbox className="size-5" strokeWidth={1.8} />
      </span>
      <p className="text-sm font-bold text-ink dark:text-white">{title}</p>
      {text && <p className="max-w-xs text-xs text-ink-soft dark:text-white/50">{text}</p>}
    </div>
  );
}

/** Etiqueta de estado con color por tipo. */
export function StatusBadge({ label, tone }: { label: string; tone: "blue" | "green" | "amber" | "gray" }) {
  const tones = {
    blue: "bg-celeste/70 text-primary",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    gray: "bg-mist text-ink-soft",
  };
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>
      {label}
    </span>
  );
}

/** Aviso persistente de modo demo. */
export function DemoBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <p className="rounded-2xl border border-sun/40 bg-sun/10 px-4 py-2.5 text-xs font-bold text-[#8a6100]">
      Modo demo activo: los números que ves son datos de demostración, no
      métricas reales. Desactivalo desde el interruptor de arriba.
    </p>
  );
}

/** Tabla simple del panel con estado vacío. */
export function DataTable<T>({
  columns,
  rows,
  renderRow,
  emptyText,
}: {
  columns: string[];
  rows: T[];
  renderRow: (row: T) => ReactNode;
  emptyText: string;
}) {
  if (rows.length === 0) {
    return <EmptyState text={emptyText} />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] font-extrabold uppercase tracking-wide text-ink-soft dark:border-white/10 dark:text-white/50">
            {columns.map((c) => (
              <th key={c} className="px-3 py-2.5">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-ink dark:divide-white/10 dark:text-white/85">
          {rows.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
}
