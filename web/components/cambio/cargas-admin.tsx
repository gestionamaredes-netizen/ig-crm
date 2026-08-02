"use client";
import { useRouter } from "next/navigation";
import type { Carga, TotalCargas, SubtotalCuenta } from "@/lib/cambio/cargas";
import type { Runner } from "@/lib/cambio/runners";

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};
const th: React.CSSProperties = { textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "0 0 10px", whiteSpace: "nowrap" };
const td: React.CSSProperties = { textAlign: "right", fontSize: 13, padding: "10px 0", borderTop: "1px solid var(--border)", whiteSpace: "nowrap" };

function fmt(n: number): string { return n.toLocaleString("es-AR", { maximumFractionDigits: 2 }); }

export function CargasAdmin({
  cargas, total, porCuenta, runners, fecha,
}: {
  cargas: Carga[]; total: TotalCargas; porCuenta: SubtotalCuenta[]; runners: Runner[]; fecha: string;
}) {
  const router = useRouter();
  const nombreRunner = (id: string | null): string => (id ? runners.find((r) => r.id === id)?.nombre ?? "—" : "—");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <input type="date" value={fecha} onChange={(e) => e.target.value && router.push(`/cambio/cargas?dia=${e.target.value}`)}
          style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "9px 12px", fontSize: 13, color: "var(--text)" }} />
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{cargas.length} carga(s) · {fecha.split("-").reverse().join("/")}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {[
          { k: "Pesos cargados", v: fmt(total.pesosCargados) },
          { k: "Dólares comprados", v: `USD ${fmt(total.usdComprados)}` },
          { k: "Dólares retirados", v: `USD ${fmt(total.usdRetirados)}` },
        ].map((c) => (
          <div key={c.k} style={{ ...panel, padding: "16px 18px" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{c.k}</div>
            <b className="tnum" style={{ fontSize: 22, fontWeight: 780, display: "block", marginTop: 8 }}>{c.v}</b>
          </div>
        ))}
      </div>

      <div style={panel}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Movimientos del día</h2>
        {cargas.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No hay cargas para este día.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ ...th, textAlign: "left" }}>Runner</th>
                <th style={{ ...th, textAlign: "left" }}>Cuenta</th>
                <th style={th}>Pesos</th><th style={th}>USD comprados</th><th style={th}>USD retirados</th>
              </tr></thead>
              <tbody>
                {cargas.map((c) => (
                  <tr key={c.id}>
                    <td style={{ ...td, textAlign: "left" }}>{nombreRunner(c.runnerId)}</td>
                    <td style={{ ...td, textAlign: "left" }}>{c.titular || "—"} <span style={{ color: "var(--muted)" }}>· {c.etiqueta}</span></td>
                    <td style={td} className="tnum">{fmt(c.pesosCargados)}</td>
                    <td style={td} className="tnum">{fmt(c.usdComprados)}</td>
                    <td style={td} className="tnum">{fmt(c.usdRetirados)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={panel}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Movimiento por cuenta</h2>
        {porCuenta.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin datos.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ ...th, textAlign: "left" }}>Cuenta</th>
                <th style={th}>Pesos</th><th style={th}>USD comprados</th><th style={th}>USD retirados</th><th style={th}>Cargas</th>
              </tr></thead>
              <tbody>
                {porCuenta.map((s) => (
                  <tr key={s.clave}>
                    <td style={{ ...td, textAlign: "left" }}>{s.titular || "—"} <span style={{ color: "var(--muted)" }}>· {s.etiqueta}</span></td>
                    <td style={td} className="tnum">{fmt(s.pesosCargados)}</td>
                    <td style={td} className="tnum">{fmt(s.usdComprados)}</td>
                    <td style={td} className="tnum">{fmt(s.usdRetirados)}</td>
                    <td style={td} className="tnum">{s.cantidad}</td>
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
