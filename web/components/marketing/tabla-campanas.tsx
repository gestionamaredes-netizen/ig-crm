import Link from "next/link";
import { formatearPesos } from "@/lib/formato";
import type { FilaCampana } from "@/lib/pautas/datos";

const coloresEstado: Record<string, { background: string; color: string }> = {
  activa: { background: "rgba(45,212,191,.15)", color: "#2dd4bf" },
  borrador: { background: "rgba(255,255,255,.07)", color: "var(--faint)" },
  pausada: { background: "rgba(245,177,60,.15)", color: "#f5b13c" },
  finalizada: { background: "rgba(255,107,107,.15)", color: "#ff8585" },
};

const tonos: Record<string, string> = { gris: "var(--faint)", ambar: "var(--warn)", neutro: "var(--faint)" };

const th: React.CSSProperties = {
  textAlign: "right",
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: ".6px",
  textTransform: "uppercase",
  color: "var(--faint)",
  padding: "0 0 10px",
};
const td: React.CSSProperties = { textAlign: "right", fontSize: 12.5, padding: "13px 0", borderTop: "1px solid var(--border)" };

export function TablaCampanas({ filas }: { filas: FilaCampana[] }) {
  if (filas.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--faint)", fontSize: 13 }}>
        Todavía no hay campañas cargadas.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left" }}>Campaña</th>
            <th style={th}>Presup./día</th>
            <th style={th}>Gasto</th>
            <th style={th}>Clics</th>
            <th style={th}>Clics a WhatsApp</th>
            <th style={th}>Leads</th>
            <th style={th}>Costo por lead</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.id}>
              <td style={{ ...td, textAlign: "left" }}>
                <Link href={`/marketing/${f.id}`} style={{ display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 3, background: f.empresaColor, flex: "none" }} />
                    <b style={{ fontSize: 13, fontWeight: 640 }}>{f.nombre}</b>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 20,
                        ...coloresEstado[f.estado],
                      }}
                    >
                      {f.estado}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--faint)", marginLeft: 17 }}>
                    {f.empresa} · {f.plataforma === "google" ? "Google Ads" : "Meta Ads"} ·{" "}
                    <span style={{ color: tonos[f.frescura.tono] }}>{f.frescura.etiqueta}</span>
                  </span>
                </Link>
              </td>
              <td style={td}>{formatearPesos(f.presupuestoDiario)}</td>
              <td style={{ ...td, fontWeight: 700 }}>{formatearPesos(f.totales.costo)}</td>
              <td style={td}>{f.totales.clics}</td>
              <td style={td}>{f.totales.clicsWhatsapp}</td>
              <td style={td}>{f.leadsAtribuidos}</td>
              <td style={td}>{f.derivadas.costoPorLead === null ? "—" : formatearPesos(f.derivadas.costoPorLead)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
