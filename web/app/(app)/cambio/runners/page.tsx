import Link from "next/link";
import { getRunners, getCuentasGestion, getGestiones, getPagosRunner } from "@/lib/cambio/runners-datos";
import { calcularRunners } from "@/lib/cambio/runners";
import { getCargas } from "@/lib/cambio/cargas-datos";
import { getCuentas } from "@/lib/cambio/cuentas-datos";
import type { Cuenta } from "@/lib/cambio/cuentas";
import { textoHojaRuta } from "@/lib/cambio/hoja-ruta";
import { HojaRutaButton } from "@/components/cambio/hoja-ruta";
import { getAccesosPorRunner } from "@/lib/cambio/acceso-datos";
import { totalPorRunner, type TotalRunner } from "@/lib/cambio/cargas";
import { formatearPesos } from "@/lib/formato";
import { RunnersHistorial } from "@/components/cambio/runners-historial";
import { NuevaGestionButton, RegistrarPagoButton, CuentasRunnerButton } from "@/components/cambio/runner-forms";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";

function usd(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

export const dynamic = "force-dynamic";

// Mismo branding dorado de Gestiones MA que el resto de la caja de cambio
// (ver web/app/(app)/cambio/page.tsx). Los runners son parte de esa misma
// herramienta.
const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

export default async function RunnersPage() {
  const [runners, cuentas, gestiones, pagos, cargas, accesos, cuentasHoja] = await Promise.all([
    getRunners(),
    getCuentasGestion(),
    getGestiones(),
    getPagosRunner(),
    getCargas(),
    getAccesosPorRunner(),
    getCuentas(),
  ]);

  const saldos = calcularRunners(runners, gestiones, pagos);
  // Movimiento de cargas por runner (automático), para mostrarlo en cada tarjeta.
  const movPorRunner = new Map<string, TotalRunner>();
  for (const t of totalPorRunner(cargas)) {
    if (t.runnerId) movPorRunner.set(t.runnerId, t);
  }

  // Cuentas asignadas a cada runner (por runnerId), para su hoja de ruta.
  const cuentasPorRunner = new Map<string, Cuenta[]>();
  for (const c of cuentasHoja) {
    if (!c.runnerId) continue;
    const arr = cuentasPorRunner.get(c.runnerId) ?? [];
    arr.push(c);
    cuentasPorRunner.set(c.runnerId, arr);
  }
  const hoy = new Date().toISOString().split("T")[0];

  return (
    <div
      style={{
        ["--accent" as string]: GM_ACCENT,
        ["--grad" as string]: GM_GRAD,
      }}
    >
      <MobileTopBar />
      <div
        className="cambio-page"
        style={{
          padding: "26px 30px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div className="cambio-head" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Runners</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
              Gestiones y pagos a los runners de Gestiones MA.
            </p>
          </div>
          <div className="cambio-head-actions" style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <Link
              href="/cambio"
              style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
            >
              Volver a Cambio
            </Link>
            <CuentasRunnerButton cuentas={cuentas} runners={runners} accesos={accesos} />
            <RegistrarPagoButton runners={runners} />
            <NuevaGestionButton runners={runners} cuentas={cuentas} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          {saldos.map((s) => {
            const mov = movPorRunner.get(s.id);
            return (
              <div key={s.id} style={{ ...panel, padding: "16px 18px", opacity: s.activo ? 1 : 0.55 }}>
                <div style={{ fontSize: 13, fontWeight: 650 }}>{s.nombre}</div>
                <b className="tnum" style={{ fontSize: 23, fontWeight: 780, letterSpacing: "-.6px", display: "block", marginTop: 8, color: "var(--accent)" }}>
                  {formatearPesos(s.pendiente)}
                </b>
                <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 11.5, color: "var(--muted)" }}>
                  <span>Gestionado <b className="tnum">{formatearPesos(s.gestionado)}</b></span>
                  <span>Pagado <b className="tnum">{formatearPesos(s.pagado)}</b></span>
                </div>
                {/* Movimiento de cargas (automático): cuánto cargó/movió el runner. */}
                <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 9, fontSize: 11.5, color: "var(--muted)", lineHeight: 1.7 }}>
                  <div>Cargó <b className="tnum" style={{ color: "var(--text)" }}>{formatearPesos(mov?.pesosCargados ?? 0)}</b></div>
                  <div>
                    Compró <b className="tnum" style={{ color: "var(--text)" }}>USD {usd(mov?.usdComprados ?? 0)}</b>
                    {" · "}Retiró <b className="tnum" style={{ color: "var(--text)" }}>USD {usd(mov?.usdRetirados ?? 0)}</b>
                  </div>
                </div>
                {(() => {
                  const ctas = cuentasPorRunner.get(s.id) ?? [];
                  if (ctas.length === 0) return null;
                  return (
                    <div style={{ marginTop: 10 }}>
                      <HojaRutaButton runner={s.nombre} texto={textoHojaRuta({ runner: s.nombre, dia: hoy, cuentas: ctas })} />
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>

        <div style={panel}>
          <RunnersHistorial gestiones={gestiones} pagos={pagos} runners={runners} cuentas={cuentas} />
        </div>
      </div>
    </div>
  );
}
