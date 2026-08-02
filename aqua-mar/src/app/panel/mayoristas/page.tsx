"use client";

import { useState, type FormEvent } from "react";
import { useDashboardData } from "@/dashboard/service";
import { KANBAN_COLUMNS, LEAD_STATUS_LABELS } from "@/dashboard/types";
import type { LeadStatus } from "@/commerce/types";
import { commerceConfig } from "@/config/commerce";
import {
  crearConsultaMayorista,
  cambiarEstadoConsulta,
} from "@/dashboard/supabase-provider";
import { PanelCard, EmptyState } from "@/components/dashboard/widgets";
import {
  PanelModal,
  FormField,
  FormSelect,
  FormTextarea,
  FormFooter,
  NewButton,
} from "@/components/dashboard/forms";

const TODOS_LOS_ESTADOS = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];

export default function MayoristasPage() {
  const { data, source } = useDashboardData();
  const conectado = source === "supabase";

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fueraDelTablero = data.leads.filter(
    (l) => !KANBAN_COLUMNS.includes(l.status)
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await crearConsultaMayorista({
      nombre: String(form.get("nombre") ?? ""),
      telefono: String(form.get("telefono") ?? ""),
      empresa: String(form.get("empresa") ?? ""),
      ciudad: String(form.get("ciudad") ?? ""),
      provincia: String(form.get("provincia") ?? ""),
      volumenEstimado: String(form.get("volumen") ?? ""),
      notas: String(form.get("notas") ?? ""),
    });
    setBusy(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">
          Pipeline mayorista
        </h1>
        {conectado && <NewButton label="Nueva consulta" onClick={() => setOpen(true)} />}
      </div>

      {data.leads.length === 0 ? (
        <PanelCard>
          <EmptyState
            text={
              conectado
                ? "Cuando llegue una consulta mayorista (por el formulario de la web o por WhatsApp), registrala acá con «Nueva consulta» y gestionala como pipeline."
                : "Las consultas mayoristas del formulario van a poder gestionarse acá como pipeline."
            }
          />
        </PanelCard>
      ) : (
        <>
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
                        {conectado && (
                          <select
                            value={l.status}
                            aria-label={`Estado de ${l.name}`}
                            onChange={(e) =>
                              cambiarEstadoConsulta(l.id, e.target.value as LeadStatus)
                            }
                            className="mt-3 h-9 w-full rounded-xl border border-border bg-white px-2 text-xs font-bold text-ink outline-none transition-all focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white"
                          >
                            {TODOS_LOS_ESTADOS.map((estado) => (
                              <option key={estado} value={estado}>
                                {LEAD_STATUS_LABELS[estado]}
                              </option>
                            ))}
                          </select>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {fueraDelTablero.length > 0 && (
            <PanelCard title="Fuera del tablero">
              <ul className="grid gap-2">
                {fueraDelTablero.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border px-4 py-3 text-sm dark:border-white/10"
                  >
                    <span className="font-bold text-ink dark:text-white/90">
                      {l.name}
                      {l.businessName ? ` — ${l.businessName}` : ""}
                    </span>
                    {conectado ? (
                      <select
                        value={l.status}
                        aria-label={`Estado de ${l.name}`}
                        onChange={(e) =>
                          cambiarEstadoConsulta(l.id, e.target.value as LeadStatus)
                        }
                        className="h-9 rounded-xl border border-border bg-white px-2 text-xs font-bold text-ink outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
                      >
                        {TODOS_LOS_ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {LEAD_STATUS_LABELS[estado]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-bold text-ink-soft dark:text-white/50">
                        {LEAD_STATUS_LABELS[l.status]}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </PanelCard>
          )}
        </>
      )}

      <PanelModal open={open} onClose={() => setOpen(false)} title="Nueva consulta mayorista">
        <form onSubmit={onSubmit} className="grid gap-3">
          <FormField label="Nombre *" name="nombre" required maxLength={120} />
          <FormField label="Empresa / comercio" name="empresa" maxLength={120} />
          <FormField
            label="WhatsApp *"
            name="telefono"
            required
            inputMode="tel"
            placeholder="11 5810 0225"
            maxLength={30}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Ciudad" name="ciudad" maxLength={80} />
            <FormField label="Provincia" name="provincia" maxLength={80} />
          </div>
          <FormSelect label="Cantidad estimada" name="volumen" defaultValue="">
            <option value="">Sin definir</option>
            {commerceConfig.quantityOptions.wholesale.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FormSelect>
          <FormTextarea label="Notas" name="notas" maxLength={500} />
          <FormFooter error={error} busy={busy} submitLabel="Guardar consulta" />
        </form>
      </PanelModal>
    </>
  );
}
