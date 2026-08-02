import Link from "next/link";
import { getCargasDelDia } from "@/lib/cambio/cargas-datos";
import { getRunners } from "@/lib/cambio/runners-datos";
import { totalDeCargas, subtotalPorCuenta } from "@/lib/cambio/cargas";
import { hoyISO } from "@/lib/cambio/datos";
import { CargasAdmin } from "@/components/cambio/cargas-admin";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";

export const dynamic = "force-dynamic";

const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

export default async function CargasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const fecha = typeof sp.dia === "string" && sp.dia ? sp.dia : hoyISO();
  const [cargas, runners] = await Promise.all([getCargasDelDia(fecha), getRunners()]);
  const total = totalDeCargas(cargas);
  const porCuenta = subtotalPorCuenta(cargas);

  return (
    <div style={{ ["--accent" as string]: GM_ACCENT, ["--grad" as string]: GM_GRAD }}>
      <MobileTopBar />
      <div className="cambio-page" style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 900, margin: "0 auto" }}>
        <div className="cambio-head" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cargas</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>Las cargas del día por cuenta y por runner.</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link href="/cambio" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}>← Volver a la caja</Link>
          </div>
        </div>
        <CargasAdmin cargas={cargas} total={total} porCuenta={porCuenta} runners={runners} fecha={fecha} />
      </div>
    </div>
  );
}
