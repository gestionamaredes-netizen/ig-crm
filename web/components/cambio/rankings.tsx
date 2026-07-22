import type { FilaCliente, FilaPersona } from "@/lib/cambio/reportes";
import { formatearPesos } from "@/lib/formato";

const th: React.CSSProperties = { textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "0 0 10px" };
const td: React.CSSProperties = { textAlign: "right", fontSize: 13, padding: "10px 0", borderTop: "1px solid var(--border)" };

function usd(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

export function Rankings({ clientes, personas }: { clientes: FilaCliente[]; personas: FilaPersona[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Por cliente</h2>
        {clientes.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin operaciones todavía.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: "left" }}>Cliente</th>
                  <th style={th}>Volumen USD</th>
                  <th style={th}>Margen</th>
                  <th style={th}>Ops</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.cliente}>
                    <td style={{ ...td, textAlign: "left" }}>{c.cliente}</td>
                    <td style={td} className="tnum">{usd(c.volumen)}</td>
                    <td style={{ ...td, color: c.margen > 0 ? "var(--ok)" : undefined }} className="tnum">
                      {formatearPesos(c.margen)}
                    </td>
                    <td style={td} className="tnum">{c.operaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Por emisor y receptor</h2>
        {/* No lleva columna de margen a propósito: el margen es de la relación
            comercial y se atribuye al cliente, no a quien puso la cuenta. */}
        {personas.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin operaciones todavía.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: "left" }}>Persona</th>
                  <th style={th}>Como emisor</th>
                  <th style={th}>Como receptor</th>
                  <th style={th}>Ops</th>
                </tr>
              </thead>
              <tbody>
                {personas.map((p) => (
                  <tr key={p.persona}>
                    <td style={{ ...td, textAlign: "left" }}>{p.persona}</td>
                    <td style={td} className="tnum">{usd(p.comoEmisor)}</td>
                    <td style={td} className="tnum">{usd(p.comoReceptor)}</td>
                    <td style={td} className="tnum">{p.operaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
