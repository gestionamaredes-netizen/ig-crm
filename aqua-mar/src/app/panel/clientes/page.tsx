"use client";

import { useDashboardData } from "@/dashboard/service";
import { PanelCard, DataTable, StatusBadge } from "@/components/dashboard/widgets";

export default function ClientesPage() {
  const { data } = useDashboardData();
  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">Clientes</h1>
      <PanelCard>
        <DataTable
          columns={["Nombre", "WhatsApp", "Ciudad", "Provincia", "Tipo", "Último pedido", "Estado"]}
          rows={data.clientes}
          emptyText="Acá se organiza tu base de clientes minoristas y mayoristas cuando empieces a cargarla."
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
    </>
  );
}
