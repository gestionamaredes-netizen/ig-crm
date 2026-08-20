"use client";
import { useState, useMemo } from "react";
import type { Carga } from "@/lib/cambio/cargas";
import { totalDeCargas, subtotalPorCuenta } from "@/lib/cambio/cargas";

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};

function fmt(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

function hoySiguiente(fecha: string): string {
  const d = new Date(fecha + "T00:00:00Z");
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

type CargaConRunner = Carga & { runnerNombre?: string };

export function DashboardCargas({
  cargas, hoy, runnerNombres,
}: {
  cargas: Carga[];
  hoy: string;
  runnerNombres: Record<string, string>;
}) {
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(hoy);

  // Cargas en el rango elegido
  const cargasEnRango = useMemo(() => {
    return cargas.filter((c) => c.fecha >= desde && c.fecha <= hasta);
  }, [cargas, desde, hasta]);

  // Resumen de hoy
  const cargasHoy = cargas.filter((c) => c.fecha === hoy);
  const resumenHoy = totalDeCargas(cargasHoy);

  // Totales por cuenta en el rango
  const subtotales = useMemo(() => {
    return subtotalPorCuenta(cargasEnRango);
  }, [cargasEnRango]);

  return (
    <div style={panel}>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Cargas</h2>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 14px" }}>
        Resumen de todas las cargas por cuenta y período.
      </p>

      {/* Resumen de hoy */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>Cargadas hoy</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{resumenHoy.cantidad}</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>Disponibles hoy</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>—</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>Pesos cargados</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>${fmt(resumenHoy.pesosCargados)}</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>USD movidos</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>USD {fmt(resumenHoy.usdComprados + resumenHoy.usdRetirados)}</div>
        </div>
      </div>

      {/* Selector de rango */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 }}>Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px",
              fontSize: 13, color: "var(--text)", fontFamily: "inherit",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 }}>Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px",
              fontSize: 13, color: "var(--text)", fontFamily: "inherit",
            }}
          />
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
          ({cargasEnRango.length} {cargasEnRango.length === 1 ? "carga" : "cargas"})
        </div>
      </div>

      {/* Tabla de totales por cuenta */}
      {subtotales.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin cargas en este período.</p>
      ) : (
        <div style={{ overflowX: "auto", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "var(--muted)" }}>Cuenta</th>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "var(--muted)" }}>Titular</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--muted)" }}>Pesos cargados</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--muted)" }}>USD comprados</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--muted)" }}>USD retirados</th>
                <th style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--muted)" }}>Cargas</th>
              </tr>
            </thead>
            <tbody>
              {subtotales.map((s, idx) => (
                <tr key={s.clave} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "transparent" : "var(--card)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600 }}>{s.etiqueta}</td>
                  <td style={{ padding: "8px 12px", color: "var(--muted)" }}>{s.titular}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>${fmt(s.pesosCargados)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>USD {fmt(s.usdComprados)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>USD {fmt(s.usdRetirados)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--muted)" }}>{s.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Historial detallado */}
      <div>
        <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>
          Historial detallado
        </h3>
        {cargasEnRango.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin cargas en este período.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cargasEnRango.map((c) => (
              <div key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "11px 13px", background: "var(--card)", fontSize: 12.5 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ fontWeight: 600 }}>{c.fecha}</div>
                  <div style={{ fontWeight: 700, color: "var(--accent)" }}>{c.etiqueta}</div>
                  <div style={{ color: "var(--muted)" }}>{runnerNombres[c.runnerId ?? ""] || c.runnerId || "—"}</div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 16, color: "var(--muted)" }}>
                    <div>${fmt(c.pesosCargados)}</div>
                    <div>USD {fmt(c.usdComprados)}</div>
                    <div>USD {fmt(c.usdRetirados)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
