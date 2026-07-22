import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCampana } from "@/lib/pautas/datos";
import { formatearPesos } from "@/lib/pautas/metricas";

export const dynamic = "force-dynamic";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};
const secTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  color: "var(--muted)",
  marginBottom: 14,
  display: "block",
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
const td: React.CSSProperties = { textAlign: "right", fontSize: 12.5, padding: "11px 0", borderTop: "1px solid var(--border)" };

export default async function DetalleCampanaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCampana(id);
  if (!c) notFound();

  const valorTotal = c.leads.reduce((s, l) => s + l.valor, 0);

  const kpis = [
    { label: "Gasto", valor: formatearPesos(c.totales.costo) },
    { label: "Clics", valor: String(c.totales.clics) },
    { label: "Clics a WhatsApp", valor: String(c.totales.clicsWhatsapp) },
    { label: "Leads", valor: String(c.leadsAtribuidos) },
    { label: "Costo por lead", valor: c.derivadas.costoPorLead === null ? "—" : formatearPesos(c.derivadas.costoPorLead) },
    { label: "Valor generado", valor: formatearPesos(valorTotal) },
  ];

  return (
    <div style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Link
          href="/marketing"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}
        >
          <ArrowLeft size={15} /> Volver a Pautas
        </Link>
        <h1 style={{ fontSize: 21, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>{c.nombre}</h1>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "5px 0 0" }}>
          {c.empresa ? `${c.empresa} · ` : ""}
          {c.plataforma === "google" ? "Google Ads" : "Meta Ads"} · {c.estado} ·{" "}
          <span style={{ color: c.frescura.tono === "ambar" ? "var(--warn)" : "var(--faint)" }}>{c.frescura.etiqueta}</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...panel, padding: "15px 17px" }}>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{k.label}</div>
            <b className="tnum" style={{ fontSize: 20, fontWeight: 770, display: "block", marginTop: 6 }}>
              {k.valor}
            </b>
          </div>
        ))}
      </div>

      <div style={panel}>
        <span style={secTitle}>Períodos cargados</span>
        {c.periodos.length === 0 ? (
          <div style={{ color: "var(--faint)", fontSize: 13, padding: "16px 0" }}>Todavía no hay métricas cargadas.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: "left" }}>Período</th>
                  <th style={th}>Impresiones</th>
                  <th style={th}>Clics</th>
                  <th style={th}>Clics a WhatsApp</th>
                  <th style={th}>Gasto</th>
                </tr>
              </thead>
              <tbody>
                {c.periodos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ ...td, textAlign: "left" }}>
                      {p.desde === p.hasta ? p.desde : `${p.desde} → ${p.hasta}`}
                      <span
                        style={{
                          marginLeft: 9,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 20,
                          background: p.origen === "sync" ? "rgba(45,212,191,.15)" : "rgba(255,255,255,.07)",
                          color: p.origen === "sync" ? "#2dd4bf" : "var(--faint)",
                        }}
                      >
                        {p.origen === "sync" ? "automático" : "manual"}
                      </span>
                    </td>
                    <td style={td}>{p.impresiones}</td>
                    <td style={td}>{p.clics}</td>
                    <td style={td}>{p.clicsWhatsapp}</td>
                    <td style={td}>{formatearPesos(p.costo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={panel}>
        <span style={secTitle}>Leads atribuidos</span>
        {c.leads.length === 0 ? (
          <div style={{ color: "var(--faint)", fontSize: 13, padding: "16px 0", lineHeight: 1.5 }}>
            Ningún lead cargado apunta todavía a esta campaña. Al dar de alta un lead vas a poder
            elegirla en el selector de pauta.
          </div>
        ) : (
          c.leads.map((l, i) => (
            <div
              key={l.id}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
            >
              <b style={{ fontSize: 13, fontWeight: 620, flex: 1, minWidth: 0 }}>{l.nombre}</b>
              {l.gclid && (
                <span style={{ fontSize: 10, color: "var(--faint)", fontFamily: "monospace" }}>{l.gclid.slice(0, 12)}…</span>
              )}
              <b className="tnum" style={{ fontSize: 13 }}>{formatearPesos(l.valor)}</b>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
