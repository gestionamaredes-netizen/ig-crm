import { getGastos, getResumenGastos, getProximosVencimientos, getEmpresasParaGasto, hoyISO } from "@/lib/finanzas/datos";
import { formatearPesos } from "@/lib/formato";
import { TablaGastos } from "@/components/finanzas/tabla-gastos";
import { ProximosVencimientos } from "@/components/finanzas/proximos-vencimientos";
import { NuevoGastoButton } from "@/components/finanzas/nuevo-gasto-form";

export const dynamic = "force-dynamic";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

export default async function FinanzasPage() {
  const hoy = hoyISO();
  const [filas, resumen, vencimientos, empresas] = await Promise.all([
    getGastos(hoy),
    getResumenGastos(hoy),
    getProximosVencimientos(hoy),
    getEmpresasParaGasto(),
  ]);

  const kpis = [
    { label: "Gasto total", valor: formatearPesos(resumen.total) },
    { label: "Gasto del mes", valor: formatearPesos(resumen.delMes) },
    { label: "Por vencer (30 días)", valor: formatearPesos(resumen.porVencer) },
    { label: "Pendiente de pago", valor: formatearPesos(resumen.pendiente) },
  ];

  return (
    <div style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Finanzas</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
            Gastos operativos y de pauta, con sus renovaciones.
          </p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <NuevoGastoButton empresas={empresas} />
        </div>
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

      <ProximosVencimientos filas={vencimientos} />

      <div style={panel}>
        <TablaGastos filas={filas} />
      </div>
    </div>
  );
}
