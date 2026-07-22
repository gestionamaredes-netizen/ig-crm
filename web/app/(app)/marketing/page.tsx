import { getCampanas, getResumenPautas } from "@/lib/pautas/datos";
import { formatearPesos } from "@/lib/pautas/metricas";
import { TablaCampanas } from "@/components/marketing/tabla-campanas";

export const dynamic = "force-dynamic";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

export default async function MarketingPage() {
  const [filas, resumen] = await Promise.all([getCampanas(), getResumenPautas()]);

  const kpis = [
    { label: "Inversión del mes", valor: formatearPesos(resumen.inversion) },
    { label: "Leads atribuidos", valor: String(resumen.leads) },
    { label: "Costo por lead", valor: resumen.costoPorLead === null ? "—" : formatearPesos(resumen.costoPorLead) },
    { label: "Campañas activas", valor: String(resumen.campanasActivas) },
  ];

  return (
    <div style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Pautas</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
          Inversión publicitaria y los leads que genera, por campaña.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...panel, padding: "16px 18px" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k.label}</div>
            <b
              className="tnum"
              style={{ fontSize: 23, fontWeight: 780, letterSpacing: "-.6px", display: "block", marginTop: 8 }}
            >
              {k.valor}
            </b>
          </div>
        ))}
      </div>

      <div style={panel}>
        <TablaCampanas filas={filas} />
      </div>
    </div>
  );
}
