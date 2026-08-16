"use client";
import { useRouter } from "next/navigation";
import type { Carga, TotalCargas, SubtotalCuenta, TotalRunner } from "@/lib/cambio/cargas";
import type { Runner } from "@/lib/cambio/runners";
import { AgregarCargaButton, type CuentaParaCargar } from "@/components/cambio/agregar-carga";

// Fecha local (Argentina) en formato YYYY-MM-DD, para los botones de período.
function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
// Rango de cada preset: hoy, esta semana (lunes→hoy) o este mes (día 1→hoy).
function rangoPreset(preset: "dia" | "semana" | "mes"): { desde: string; hasta: string } {
  const hoy = new Date();
  const hasta = ymd(hoy);
  if (preset === "dia") return { desde: hasta, hasta };
  if (preset === "semana") {
    const lunes = new Date(hoy);
    const dow = (hoy.getDay() + 6) % 7; // 0 = lunes
    lunes.setDate(hoy.getDate() - dow);
    return { desde: ymd(lunes), hasta };
  }
  const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  return { desde: ymd(primero), hasta };
}

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
  cargas, total, porCuenta, porRunner, runners, desde, hasta, cuentasParaCargar,
}: {
  cargas: Carga[]; total: TotalCargas; porCuenta: SubtotalCuenta[]; porRunner: TotalRunner[]; runners: Runner[];
  desde: string; hasta: string; cuentasParaCargar: CuentaParaCargar[];
}) {
  const router = useRouter();
  const nombreRunner = (id: string | null): string => (id ? runners.find((r) => r.id === id)?.nombre ?? "—" : "—");

  const irRango = (d: string, h: string) => router.push(`/cambio/cargas?desde=${d}&hasta=${h}`);
  const unSoloDia = desde === hasta;

  // ¿Qué preset está activo? (para resaltar el botón).
  const presetActivo = (["dia", "semana", "mes"] as const).find((p) => {
    const r = rangoPreset(p);
    return r.desde === desde && r.hasta === hasta;
  });
  const botonPreset = (activo: boolean): React.CSSProperties => ({
    borderRadius: 11, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
    border: `1px solid ${activo ? "var(--accent)" : "var(--border)"}`,
    background: activo ? "var(--card)" : "transparent",
    color: activo ? "var(--text)" : "var(--muted)",
  });
  const presets: { clave: "dia" | "semana" | "mes"; texto: string }[] = [
    { clave: "dia", texto: "Hoy" }, { clave: "semana", texto: "Semana" }, { clave: "mes", texto: "Mes" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Botones rápidos de período. */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {presets.map((p) => {
          const r = rangoPreset(p.clave);
          return (
            <button key={p.clave} type="button" onClick={() => irRango(r.desde, r.hasta)} style={botonPreset(presetActivo === p.clave)}>
              {p.texto}
            </button>
          );
        })}
        <span style={{ fontSize: 12.5, color: "var(--muted)", marginLeft: 4 }}>
          {desde.split("-").reverse().join("/")}{unSoloDia ? "" : ` → ${hasta.split("-").reverse().join("/")}`} · {cargas.length} carga(s)
        </span>
        <div style={{ marginLeft: "auto" }}>
          <AgregarCargaButton cuentas={cuentasParaCargar} fechaDefault={hasta} />
        </div>
      </div>

      {/* Rango a medida (por si quieren fechas puntuales). */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 }}>Desde</label>
          <input type="date" value={desde} onChange={(e) => e.target.value && irRango(e.target.value, hasta)} style={inputFecha} />
        </div>
        <div>
          <label style={{ fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 }}>Hasta</label>
          <input type="date" value={hasta} onChange={(e) => e.target.value && irRango(desde, e.target.value)} style={inputFecha} />
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
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Por runner</h2>
        {porRunner.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin cargas en este período.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                <th style={{ ...th, textAlign: "left" }}>Runner</th>
                <th style={th}>Pesos</th><th style={th}>USD comprados</th><th style={th}>USD retirados</th><th style={th}>Cargas</th>
              </tr></thead>
              <tbody>
                {[...porRunner].sort((a, b) => b.pesosCargados - a.pesosCargados).map((r) => (
                  <tr key={r.runnerId ?? "sin"}>
                    <td style={{ ...td, textAlign: "left" }}>{nombreRunner(r.runnerId)}</td>
                    <td style={td} className="tnum">{fmt(r.pesosCargados)}</td>
                    <td style={td} className="tnum">{fmt(r.usdComprados)}</td>
                    <td style={td} className="tnum">{fmt(r.usdRetirados)}</td>
                    <td style={td} className="tnum">{r.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
