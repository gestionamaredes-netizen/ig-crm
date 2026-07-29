"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { OperacionCalculada } from "@/lib/cambio/calculo";
import { formatearPesos } from "@/lib/formato";

const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

type Modo = "interno" | "cliente";

type Props = {
  cliente: string;
  operaciones: OperacionCalculada[];
};

const ETIQUETA_TIPO: Record<string, string> = {
  compra: "COMPRA",
  venta: "VENTA",
  carga: "CARGA",
  canje: "CANJE",
};

function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatearNumero(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

// Componente cliente: recibe SOLO datos serializables (cliente + operaciones
// ya calculadas), nunca funciones del server. La página server hace todo el
// fetch y el filtro por cliente; acá adentro sólo se filtra por fecha y se
// arma la vista, en dos modos.
export function ComprobanteCliente({ cliente, operaciones }: Props) {
  const [modo, setModo] = useState<Modo>("interno");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const ops = useMemo(
    () =>
      operaciones
        .filter((o) => (!desde || o.fecha >= desde) && (!hasta || o.fecha <= hasta))
        .sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0)),
    [operaciones, desde, hasta],
  );

  const totalUsd = ops.reduce((acc, o) => acc + o.usd, 0);
  const totalArs = ops.reduce((acc, o) => acc + o.ars, 0);
  const totalMargen = ops.reduce((acc, o) => acc + o.margen, 0);
  const totalComisiones = ops.reduce((acc, o) => acc + o.costos, 0);

  const rango =
    desde || hasta
      ? `${desde ? formatearFecha(desde) : "…"} — ${hasta ? formatearFecha(hasta) : "…"}`
      : "Todas las operaciones";

  return (
    <div
      className="cambio-page"
      style={{ padding: "18px 30px 40px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 820, margin: "0 auto" }}
    >
      {/* Controles: no se imprimen (.no-print, ver globals.css). */}
      <div
        className="no-print"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          background: "var(--glass)",
          backdropFilter: "blur(16px)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 16,
        }}
      >
        <div style={{ display: "inline-flex", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2 }}>
          <button
            type="button"
            onClick={() => setModo("interno")}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 650,
              border: "none",
              cursor: "pointer",
              background: modo === "interno" ? GM_ACCENT : "transparent",
              color: modo === "interno" ? "#1a1205" : "var(--muted)",
            }}
          >
            Interno
          </button>
          <button
            type="button"
            onClick={() => setModo("cliente")}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 650,
              border: "none",
              cursor: "pointer",
              background: modo === "cliente" ? GM_ACCENT : "transparent",
              color: modo === "cliente" ? "#1a1205" : "var(--muted)",
            }}
          >
            Para el cliente
          </button>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--muted)" }}>
          Desde
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", color: "var(--text)", fontSize: 12.5 }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--muted)" }}>
          Hasta
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 8px", color: "var(--text)", fontSize: 12.5 }}
          />
        </label>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            marginLeft: "auto",
            background: GM_GRAD,
            border: "none",
            borderRadius: 10,
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 700,
            color: "#1a1205",
            cursor: "pointer",
          }}
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Hoja del comprobante: colores fijos (no CSS vars del tema) para que
          salga siempre igual — legible en pantalla clara u oscura, y bien
          impreso en papel blanco. */}
      <div
        className="comprobante"
        style={{
          background: "#ffffff",
          color: "#15130f",
          borderRadius: 14,
          padding: "34px 38px",
          boxShadow: "0 4px 30px rgba(0,0,0,.35)",
        }}
      >
        {modo === "cliente" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "2px solid #eee", paddingBottom: 16, marginBottom: 16 }}>
            <span style={{ position: "relative", width: 34, height: 42, flex: "none" }}>
              <Image src="/logos/gestiones-mark.png" alt="Gestiones MA" fill sizes="34px" style={{ objectFit: "contain" }} />
            </span>
            <div>
              <b style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.4px", color: "#15130f" }}>
                Gestiones<span style={{ color: GM_ACCENT }}>MA</span>
              </b>
              <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#8a8a8a", marginTop: 2 }}>CAJA DE CAMBIO</div>
            </div>
          </div>
        ) : (
          <div style={{ borderBottom: "2px solid #eee", paddingBottom: 16, marginBottom: 16 }}>
            <h1 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: "#15130f" }}>Comprobante interno</h1>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 20, fontSize: 13 }}>
          <div>
            <b>Cliente:</b> {cliente || "(sin cliente)"}
          </div>
          <div style={{ color: "#666" }}>{rango}</div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ borderBottom: "1.5px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: "8px 6px" }}>Fecha</th>
              <th style={{ padding: "8px 6px" }}>Tipo</th>
              <th style={{ padding: "8px 6px", textAlign: "right" }}>USD</th>
              <th style={{ padding: "8px 6px", textAlign: "right" }}>Pesos</th>
              <th style={{ padding: "8px 6px", textAlign: "right" }}>TC</th>
            </tr>
          </thead>
          <tbody>
            {ops.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "16px 6px", textAlign: "center", color: "#999" }}>
                  Sin operaciones en este rango.
                </td>
              </tr>
            ) : (
              ops.map((o) => {
                const esCanje = o.tipo === "canje";
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "7px 6px" }}>{formatearFecha(o.fecha)}</td>
                    <td style={{ padding: "7px 6px" }}>{ETIQUETA_TIPO[o.tipo] ?? o.tipo.toUpperCase()}</td>
                    <td className="tnum" style={{ padding: "7px 6px", textAlign: "right" }}>
                      {esCanje ? "—" : formatearNumero(o.usd)}
                    </td>
                    <td className="tnum" style={{ padding: "7px 6px", textAlign: "right" }}>
                      {esCanje ? "—" : formatearPesos(o.ars)}
                    </td>
                    <td className="tnum" style={{ padding: "7px 6px", textAlign: "right" }}>
                      {esCanje ? "—" : formatearNumero(o.tc)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "2px solid #eee", display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Total USD</span>
            <b className="tnum">{formatearNumero(totalUsd)}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Total pesos</span>
            <b className="tnum">{formatearPesos(totalArs)}</b>
          </div>
          {modo === "interno" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#8a6b1f" }}>
                <span>Margen de ganancia</span>
                <b className="tnum">{formatearPesos(totalMargen)}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Comisiones</span>
                <b className="tnum">{formatearPesos(totalComisiones)}</b>
              </div>
            </>
          )}
        </div>

        {modo === "cliente" && (
          <div style={{ marginTop: 26, paddingTop: 16, borderTop: "1px solid #eee", textAlign: "center", fontSize: 12, color: "#666", lineHeight: 1.6 }}>
            <p style={{ margin: 0 }}>Gracias por la confianza. Gestiones MA — Soluciones financieras para su bienestar.</p>
            <p style={{ margin: "2px 0 0", color: GM_ACCENT, fontWeight: 600 }}>gestionesma.store</p>
          </div>
        )}
      </div>
    </div>
  );
}
