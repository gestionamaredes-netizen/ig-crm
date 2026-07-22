import { getDatosCambio, getClientesParaOperacion, getCajasParaOperacion, hoyISO } from "@/lib/cambio/datos";
import { formatearPesos } from "@/lib/formato";
import { TablaOperaciones } from "@/components/cambio/tabla-operaciones";
import { Rankings } from "@/components/cambio/rankings";
import { NuevaOperacionButton } from "@/components/cambio/nueva-operacion-form";

export const dynamic = "force-dynamic";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

export default async function CambioPage() {
  const hoy = hoyISO();
  const [{ operaciones, saldos, resumen, clientes: rankingDeClientes, personas }, clientes, cajas] = await Promise.all([
    getDatosCambio(hoy),
    getClientesParaOperacion(),
    getCajasParaOperacion(),
  ]);

  const kpis = [
    { label: "Stock de dólares", valor: resumen.stockUsd.toLocaleString("es-AR", { maximumFractionDigits: 2 }) },
    { label: "Costo promedio", valor: formatearPesos(resumen.costoPromedio) },
    { label: "Margen del mes", valor: formatearPesos(resumen.margenDelMes) },
    { label: "Margen acumulado", valor: formatearPesos(resumen.margenTotal) },
  ];

  return (
    <div style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cambio</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
            Compra y venta de dólares de Gestiones MA.
          </p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <NuevaOperacionButton clientes={clientes} cajas={cajas} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...panel, padding: "16px 18px" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k.label}</div>
            <b className="tnum" style={{ fontSize: 23, fontWeight: 780, letterSpacing: "-.6px", display: "block", marginTop: 8 }}>
              {k.valor}
            </b>
          </div>
        ))}
      </div>

      <div style={panel}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Cajas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          {saldos.map((s) => (
            <div key={s.id}>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{s.nombre}</div>
              {/* Caja en descubierto = falta cargar una operación o hay plata mal imputada. Se marca en vez de disimularse. */}
              <b
                className="tnum"
                style={{ fontSize: 16, display: "block", marginTop: 4, color: s.saldo < 0 ? "var(--warn)" : undefined }}
              >
                {s.moneda === "ARS"
                  ? formatearPesos(s.saldo)
                  : `USD ${s.saldo.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`}
              </b>
            </div>
          ))}
        </div>
      </div>

      <div style={panel}>
        <Rankings clientes={rankingDeClientes} personas={personas} />
      </div>

      <div style={panel}>
        <TablaOperaciones filas={operaciones} />
      </div>
    </div>
  );
}
