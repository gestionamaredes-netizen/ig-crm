"use client";

import { useState, type FormEvent } from "react";
import { useDashboardData } from "@/dashboard/service";
import { ORDER_STATUS_LABELS } from "@/dashboard/types";
import type { OrderStatus } from "@/commerce/types";
import { products } from "@/data/products";
import { crearPedido, cambiarEstadoPedido } from "@/dashboard/supabase-provider";
import { PanelCard, DataTable, StatusBadge } from "@/components/dashboard/widgets";
import {
  PanelModal,
  FormField,
  FormSelect,
  FormTextarea,
  FormFooter,
  NewButton,
} from "@/components/dashboard/forms";

const ESTADOS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default function PedidosPage() {
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
    const producto = products.find((p) => p.id === form.get("producto"));
    const cantidad = Number(form.get("cantidad"));
    const result = await crearPedido({
      clienteId: String(form.get("cliente") ?? ""),
      producto: producto?.name ?? "Powerful",
      presentacion: producto?.presentation ?? "",
      cantidad: Number.isFinite(cantidad) && cantidad > 0 ? cantidad : undefined,
      provincia: String(form.get("provincia") ?? ""),
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
        <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">Pedidos</h1>
        {conectado && <NewButton label="Nuevo pedido" onClick={() => setOpen(true)} />}
      </div>
      <PanelCard>
        <DataTable
          columns={["ID", "Cliente", "Producto", "Presentación", "Estado", "Provincia"]}
          rows={data.pedidos}
          emptyText={
            conectado
              ? data.clientes.length === 0
                ? "Para registrar el primer pedido, primero cargá el cliente en la sección Clientes."
                : "Todavía no hay pedidos cargados. Usá «Nuevo pedido»: queda guardado para todo el equipo."
              : "Cuando registres pedidos (a mano o desde un CRM conectado), se listan acá con su estado."
          }
          renderRow={(o) => (
            <tr key={o.id}>
              <td className="px-3 py-3 font-bold uppercase">
                {o.id.length > 12 ? o.id.slice(0, 8) : o.id}
              </td>
              <td className="px-3 py-3">{o.customerName}</td>
              <td className="px-3 py-3">{o.product}</td>
              <td className="px-3 py-3">{o.presentation}</td>
              <td className="px-3 py-3">
                {conectado ? (
                  <select
                    value={o.status}
                    aria-label={`Estado del pedido de ${o.customerName}`}
                    onChange={(e) => cambiarEstadoPedido(o.id, e.target.value as OrderStatus)}
                    className="h-9 rounded-xl border border-border bg-white px-2 text-xs font-bold text-ink outline-none transition-all focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white"
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {ORDER_STATUS_LABELS[estado]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge
                    label={ORDER_STATUS_LABELS[o.status]}
                    tone={o.status === "entregado" ? "green" : o.status === "despachado" ? "blue" : "amber"}
                  />
                )}
              </td>
              <td className="px-3 py-3 text-ink-soft dark:text-white/50">{o.province ?? "—"}</td>
            </tr>
          )}
        />
      </PanelCard>

      <PanelModal open={open} onClose={() => setOpen(false)} title="Nuevo pedido">
        {data.clientes.length === 0 ? (
          <p className="text-sm text-ink-soft dark:text-white/60">
            Primero cargá el cliente en la sección <strong>Clientes</strong> y
            después registrá acá su pedido.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-3">
            <FormSelect label="Cliente *" name="cliente" required defaultValue="">
              <option value="" disabled>
                Elegí un cliente
              </option>
              {data.clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.businessName ? ` — ${c.businessName}` : ""}
                </option>
              ))}
            </FormSelect>
            <FormSelect label="Producto *" name="producto" required defaultValue={products[0]?.id}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.presentation}
                </option>
              ))}
            </FormSelect>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Cantidad" name="cantidad" type="number" min={1} max={9999} />
              <FormField label="Provincia" name="provincia" maxLength={80} />
            </div>
            <FormTextarea label="Notas" name="notas" maxLength={500} />
            <FormFooter error={error} busy={busy} submitLabel="Guardar pedido" />
          </form>
        )}
      </PanelModal>
    </>
  );
}
