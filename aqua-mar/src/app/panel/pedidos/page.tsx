"use client";

import { useDashboardData } from "@/dashboard/service";
import { ORDER_STATUS_LABELS } from "@/dashboard/types";
import { PanelCard, DataTable, StatusBadge } from "@/components/dashboard/widgets";

export default function PedidosPage() {
  const { data } = useDashboardData();
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">Pedidos</h1>
      <PanelCard>
        <DataTable
          columns={["ID", "Cliente", "Producto", "Presentación", "Estado", "Provincia"]}
          rows={data.pedidos}
          emptyText="Cuando registres pedidos (a mano o desde un CRM conectado), se listan acá con su estado."
          renderRow={(o) => (
            <tr key={o.id}>
              <td className="px-3 py-3 font-bold">{o.id}</td>
              <td className="px-3 py-3">{o.customerName}</td>
              <td className="px-3 py-3">{o.product}</td>
              <td className="px-3 py-3">{o.presentation}</td>
              <td className="px-3 py-3">
                <StatusBadge
                  label={ORDER_STATUS_LABELS[o.status]}
                  tone={o.status === "entregado" ? "green" : o.status === "despachado" ? "blue" : "amber"}
                />
              </td>
              <td className="px-3 py-3 text-ink-soft dark:text-white/50">{o.province ?? "—"}</td>
            </tr>
          )}
        />
      </PanelCard>
    </>
  );
}
