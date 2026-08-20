import Link from "next/link";
import { getRunners } from "@/lib/cambio/runners-datos";
import { getCargas } from "@/lib/cambio/cargas-datos";
import { DashboardCargas } from "@/components/cambio/dashboard-cargas";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";

export const dynamic = "force-dynamic";

const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

export default async function CargasPage() {
  const [runners, cargas] = await Promise.all([
    getRunners(),
    getCargas(),
  ]);

  // Mapa de runner_id -> nombre
  const runnerNombres = Object.fromEntries(
    runners.map((r) => [r.id, r.nombre]),
  );

  // Hoy en formato YYYY-MM-DD
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
            <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cargas</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
              Resumen de todas las cargas por cuenta y período.
            </p>
          </div>
          <div className="cambio-head-actions" style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <Link
              href="/cambio"
              style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
            >
              Volver a Cambio
            </Link>
          </div>
        </div>

        <DashboardCargas cargas={cargas} hoy={hoy} runnerNombres={runnerNombres} />
      </div>
    </div>
  );
}
