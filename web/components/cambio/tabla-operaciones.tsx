import type { OperacionCalculada } from "@/lib/cambio/calculo";
import { formatearPesos } from "@/lib/formato";

const th: React.CSSProperties = {
  textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600,
  padding: "0 0 10px", whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  textAlign: "right", fontSize: 13, padding: "11px 0", borderTop: "1px solid var(--border)",
  whiteSpace: "nowrap",
};

function usd(n: number): string {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function TablaOperaciones({ filas }: { filas: OperacionCalculada[] }) {
  if (filas.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, padding: "6px 0" }}>
        Todavía no cargaste operaciones. Empezá con el botón <b>Nueva operación</b>.
      </p>
    );
  }

  // Más recientes primero para mirar: `calcular` las devuelve en orden
  // cronológico porque lo necesita para el costo promedio.
  const orden = [...filas].reverse();

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left" }}>Fecha</th>
            <th style={{ ...th, textAlign: "left" }}>Tipo</th>
            <th style={{ ...th, textAlign: "left" }}>Cliente</th>
            <th style={{ ...th, textAlign: "left" }}>Emisor → Receptor</th>
            <th style={th}>USD</th>
            <th style={th}>Pesos</th>
            <th style={th}>TC</th>
            <th style={th}>Margen</th>
            <th style={th}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {orden.map((o) => (
            <tr key={o.id}>
              <td style={{ ...td, textAlign: "left" }}>{o.fecha.split("-").reverse().join("/")}</td>
              <td style={{ ...td, textAlign: "left" }}>
                <span
                  style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                    color: o.tipo === "compra" ? "var(--ok)" : "var(--accent)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {o.tipo === "compra" ? "COMPRA" : "VENTA"}
                </span>
              </td>
              <td style={{ ...td, textAlign: "left" }}>{o.cliente || "—"}</td>
              <td style={{ ...td, textAlign: "left", color: "var(--muted)", fontSize: 12 }}>
                {o.emisor || "—"} → {o.receptor || "—"}
              </td>
              <td style={td} className="tnum">{usd(o.usd)}</td>
              <td style={td} className="tnum">{formatearPesos(o.ars)}</td>
              <td style={td} className="tnum">{o.tc.toLocaleString("es-AR")}</td>
              <td
                style={{
                  ...td,
                  color: o.margen > 0 ? "var(--ok)" : o.margen < 0 ? "var(--warn)" : "var(--muted)",
                }}
                className="tnum"
              >
                {o.tipo === "venta" ? formatearPesos(o.margen) : "—"}
              </td>
              {/* Stock negativo = falta cargar una compra. Se marca en vez de disimularse. */}
              <td style={{ ...td, color: o.stock < 0 ? "var(--warn)" : undefined }} className="tnum">
                {usd(o.stock)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
