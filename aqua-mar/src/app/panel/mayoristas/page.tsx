"use client";

import { useDashboardData } from "@/dashboard/service";
import { KANBAN_COLUMNS, LEAD_STATUS_LABELS } from "@/dashboard/types";
import { PanelCard, EmptyState } from "@/components/dashboard/widgets";

export default function MayoristasPage() {
  const { data } = useDashboardData();
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">
        Pipeline mayorista
      </h1>
      {data.leads.length === 0 ? (
        <PanelCard>
          <EmptyState text="Las consultas mayoristas del formulario van a poder gestionarse acá como pipeline." />
        </PanelCard>
      ) : (
        <div className="grid gap-4 overflow-x-auto md:grid-cols-3 xl:grid-cols-5">
          {KANBAN_COLUMNS.map((col) => {
            const items = data.leads.filter((l) => l.status === col);
            return (
              <div key={col} className="min-w-[220px]">
                <p className="mb-2 flex items-center justify-between text-xs font-extrabold uppercase tracking-wide text-ink-soft dark:text-white/50">
                  {LEAD_STATUS_LABELS[col]}
                  <span className="rounded-full bg-mist px-2 py-0.5 tabular-nums dark:bg-white/10">
                    {items.length}
                  </span>
                </p>
                <div className="grid gap-2.5">
                  {items.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-ink-soft/60 dark:border-white/10 dark:text-white/30">
                      Vacío
                    </div>
                  )}
                  {items.map((l) => (
                    <article
                      key={l.id}
                      className="rounded-2xl border border-border bg-white p-4 shadow-xs dark:border-white/10 dark:bg-white/5"
                    >
                      <p className="text-sm font-bold text-ink dark:text-white">{l.name}</p>
                      {l.businessName && (
                        <p className="text-xs text-ink-soft dark:text-white/50">{l.businessName}</p>
                      )}
                      <p className="mt-2 text-xs text-ink-soft dark:text-white/50">
                        {l.province ?? "—"}
                        {l.estimatedVolume && ` · ${l.estimatedVolume}`}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
