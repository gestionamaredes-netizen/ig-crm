"use client";

import { useState, type FormEvent } from "react";
import { useDashboardData } from "@/dashboard/service";
import { crearCliente } from "@/dashboard/supabase-provider";
import { PanelCard, DataTable, StatusBadge } from "@/components/dashboard/widgets";
import {
  PanelModal,
  FormField,
  FormSelect,
  FormTextarea,
  FormFooter,
  NewButton,
} from "@/components/dashboard/forms";

export default function ClientesPage() {
  const { data, source } = useDashboardData();
  const conectado = source === "supabase";

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await crearCliente({
      nombre: String(form.get("nombre") ?? ""),
      telefono: String(form.get("telefono") ?? ""),
      tipo: form.get("tipo") === "wholesale" ? "wholesale" : "retail",
      ciudad: String(form.get("ciudad") ?? ""),
      provincia: String(form.get("provincia") ?? ""),
      empresa: String(form.get("empresa") ?? ""),
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
        <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">Clientes</h1>
        {conectado && <NewButton label="Nuevo cliente" onClick={() => setOpen(true)} />}
      </div>
      <PanelCard>
        <DataTable
          columns={["Nombre", "WhatsApp", "Ciudad", "Provincia", "Tipo", "Último pedido", "Pedidos"]}
          rows={data.clientes}
          emptyText={
            conectado
              ? "Todavía no hay clientes cargados. Usá el botón «Nuevo cliente» para sumar el primero: lo va a ver todo el equipo."
              : "Acá se organiza tu base de clientes minoristas y mayoristas cuando empieces a cargarla."
          }
          renderRow={(c) => (
            <tr key={c.id}>
              <td className="px-3 py-3 font-bold">
                {c.name}
                {c.businessName && (
                  <span className="block text-xs font-medium text-ink-soft dark:text-white/50">
                    {c.businessName}
                  </span>
                )}
              </td>
              <td className="px-3 py-3">{c.phone}</td>
              <td className="px-3 py-3">{c.city ?? "—"}</td>
              <td className="px-3 py-3">{c.province ?? "—"}</td>
              <td className="px-3 py-3">
                <StatusBadge
                  label={c.type === "wholesale" ? "Mayorista" : "Minorista"}
                  tone={c.type === "wholesale" ? "blue" : "gray"}
                />
              </td>
              <td className="px-3 py-3">{c.lastOrder ?? "—"}</td>
              <td className="px-3 py-3 text-ink-soft dark:text-white/50">{c.statusLabel}</td>
            </tr>
          )}
        />
      </PanelCard>

      <PanelModal open={open} onClose={() => setOpen(false)} title="Nuevo cliente">
        <form onSubmit={onSubmit} className="grid gap-3">
          <FormField label="Nombre *" name="nombre" required maxLength={120} />
          <FormField
            label="WhatsApp *"
            name="telefono"
            required
            inputMode="tel"
            placeholder="11 5810 0225"
            maxLength={30}
          />
          <FormSelect label="Tipo" name="tipo" defaultValue="retail">
            <option value="retail">Minorista</option>
            <option value="wholesale">Mayorista</option>
          </FormSelect>
          <FormField label="Empresa / comercio" name="empresa" maxLength={120} />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Ciudad" name="ciudad" maxLength={80} />
            <FormField label="Provincia" name="provincia" maxLength={80} />
          </div>
          <FormTextarea label="Notas" name="notas" maxLength={500} />
          <FormFooter error={error} busy={busy} submitLabel="Guardar cliente" />
        </form>
      </PanelModal>
    </>
  );
}
