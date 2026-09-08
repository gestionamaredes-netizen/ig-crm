"use client";

import { useDashboardData } from "@/dashboard/service";
import { PanelCard, EmptyState } from "@/components/dashboard/widgets";
import { ArgentinaMap } from "@/components/ui/ArgentinaMap";

export default function CoberturaPage() {
  const { data } = useDashboardData();
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">Cobertura</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title="Mapa de consultas">
          <ArgentinaMap className={`mx-auto h-80 w-auto ${data.cobertura.length === 0 ? "opacity-60" : ""}`} />
        </PanelCard>
        <PanelCard title="Consultas por provincia">
          {data.cobertura.length === 0 ? (
            <EmptyState text="Cuando la analítica esté conectada, acá se ve desde qué provincias consultan." />
          ) : (
            <ul className="grid gap-2">
              {data.cobertura.map((c) => {
                const max = Math.max(...data.cobertura.map((x) => x.consultas));
                return (
                  <li key={c.province}>
                    <div className="mb-1 flex justify-between text-sm font-semibold text-ink dark:text-white/85">
                      {c.province}
                      <span className="tabular-nums text-ink-soft dark:text-white/50">{c.consultas}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-mist dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-turquesa"
                        style={{ width: `${(c.consultas / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PanelCard>
      </div>
    </>
  );
}
