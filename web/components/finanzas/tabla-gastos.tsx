import { formatearPesos } from "@/lib/formato";
import type { FilaGasto } from "@/lib/finanzas/datos";

const etiquetasCategoria: Record<string, string> = {
  dominio: "Dominio",
  hosting: "Hosting",
  herramienta: "Herramienta",
  merch: "Merch",
  servicio: "Servicio",
  otro: "Otro",
};

const th: React.CSSProperties = {
  textAlign: "right",
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: ".6px",
  textTransform: "uppercase",
  color: "var(--faint)",
  padding: "0 0 10px",
};
const td: React.CSSProperties = {
  textAlign: "right",
  fontSize: 12.5,
  padding: "13px 0",
  borderTop: "1px solid var(--border)",
};

export function TablaGastos({ filas }: { filas: FilaGasto[] }) {
  if (filas.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--faint)", fontSize: 13 }}>
        Todavía no hay gastos cargados.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left" }}>Concepto</th>
            <th style={th}>Categoría</th>
            <th style={th}>Cant.</th>
            <th style={th}>Unitario</th>
            <th style={th}>Monto</th>
            <th style={th}>Pagado</th>
            <th style={th}>Vence</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.id}>
              <td style={{ ...td, textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: f.empresaColor, flex: "none" }} />
                  <b style={{ fontSize: 13, fontWeight: 640 }}>{f.concepto}</b>
                </div>
                <span style={{ fontSize: 11, color: "var(--faint)", marginLeft: 17 }}>
                  {f.empresa}
                  {f.proveedor && ` · ${f.proveedor}`}
                  {f.referencia && ` · ${f.referencia}`}
                </span>
              </td>
              <td style={td}>{etiquetasCategoria[f.categoria] ?? f.categoria}</td>
              <td style={td}>{f.cantidad}</td>
              <td style={td}>{f.unitario === null ? "—" : formatearPesos(f.unitario)}</td>
              <td style={{ ...td, fontWeight: 700 }}>{formatearPesos(f.monto)}</td>
              <td style={{ ...td, color: f.pagadoEl ? "var(--text)" : "var(--warn)" }}>
                {f.pagadoEl ?? "Pendiente"}
              </td>
              <td style={td}>{f.renuevaEl ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
