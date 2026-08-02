"use client";
import { useRouter } from "next/navigation";
import type { Carga, TotalCargas, SubtotalCuenta } from "@/lib/cambio/cargas";
import type { Runner } from "@/lib/cambio/runners";
import { AgregarCargaButton, type CuentaParaCargar } from "@/components/cambio/agregar-carga";

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};
const th: React.CSSProperties = { textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "0 0 10px", whiteSpace: "nowrap" };
const td: React.CSSProperties = { textAlign: "right", fontSize: 13, padding: "10px 0", borderTop: "1px solid var(--border)", whiteSpace: "nowrap" };

function fmt(n: number): string { return n.toLocaleString("es-AR", { maximumFractionDigits: 2 }); }

const inputFecha: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11,
  padding: "9px 12px", fontSize: 13, color: "var(--text)",
};

export function CargasAdmin({
  cargas, total, porCuenta, runners, desde, hasta, cuentasParaCargar,
}: {
  cargas: Carga[]; total: TotalCargas; porCuenta: SubtotalCuenta[]; runners: Runner[];
  desde: string; hasta: string; cuentasParaCargar: CuentaParaCargar[];
}) {
  const router = useRouter();
  const nombreRunner = (id: string | null): string => (id ? runners.find((r) => r.id === id)?.nombre ?? "—" : "—");

  const irRango = (d: string, h: string) => router.push(`/cambio/cargas?desde=${d}&hasta=${h}`);
  const unSoloDia = desde === hasta;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 }}>Desde</label>
          <input type="date" value={desde} onChange={(e) => e.target.value && irRango(e.target.value, hasta)} style={inputFecha} />
        </div>
        <div>
          <label style={{ fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 }}>Hasta</label>
          <input type="date" value={hasta} onChange={(e) => e.target.value && irRango(desde, e.target.value)} style={inputFecha} />
        </div>
        <span style={{ fontSize: 13, color: "var(--muted)", paddingBottom: 9 }}>{cargas.length} carga(s)</span>
        <div style={{ marginLeft: "auto", paddingBottom: 2 }}>
          <AgregarCargaButton cuentas={cuentasParaCargar} fechaDefault={hasta} />
        </div>
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
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>
          Movimientos {unSoloDia ? `del ${desde.split("-").reverse().join("/")}` : "del período"}
        </h2>
        {cargas.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No hay cargas en este período.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ ...th, textAlign: "left" }}>Fecha</th>
                <th style={{ ...th, textAlign: "left" }}>Runner</th>
                <th style={{ ...th, textAlign: "left" }}>Cuenta</th>
                <th style={th}>Pesos</th><th style={th}>USD comprados</th><th style={th}>USD retirados</th>
              </tr></thead>
              <tbody>
                {cargas.map((c) => (
                  <tr key={c.id}>
                    <td style={{ ...td, textAlign: "left" }}>{c.fecha.split("-").reverse().join("/")}</td>
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
