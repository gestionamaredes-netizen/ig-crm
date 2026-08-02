import Link from "next/link";
import { getCargasEnRango } from "@/lib/cambio/cargas-datos";
import { getRunners } from "@/lib/cambio/runners-datos";
import { getCelulares, getCuentasOperativas } from "@/lib/cambio/celulares-datos";
import { getCuentas } from "@/lib/cambio/cuentas-datos";
import { totalDeCargas, subtotalPorCuenta } from "@/lib/cambio/cargas";
import { hoyISO } from "@/lib/cambio/datos";
import { CargasAdmin } from "@/components/cambio/cargas-admin";
import type { CuentaParaCargar } from "@/components/cambio/agregar-carga";
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
  const hoy = hoyISO();
  const s = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : "");
  // Compatibilidad con el link viejo `?dia=`; por defecto, hoy–hoy.
  const dia = s(sp.dia);
  const desde = s(sp.desde) || dia || hoy;
  const hasta = s(sp.hasta) || dia || hoy;

  const [cargas, runners, celulares, operativas, bancarias] = await Promise.all([
    getCargasEnRango(desde, hasta),
    getRunners(),
    getCelulares(),
    getCuentasOperativas(),
    getCuentas(),
  ]);
  const total = totalDeCargas(cargas);
  const porCuenta = subtotalPorCuenta(cargas);

  // Cuentas elegibles para "Agregar carga" (todas: operativas + bancarias),
  // con una etiqueta legible (titular · celu/bancaria · runner). Solo datos
  // serializables para el client component.
  const cuentasParaCargar: CuentaParaCargar[] = [
    ...operativas.map((o) => {
      const cel = celulares.find((c) => c.id === o.celularId);
      const runner = cel?.runner ? ` · ${cel.runner}` : "";
      return {
        clave: `operativa:${o.id}`, origen: "operativa" as const, sourceId: o.id,
        label: `${o.titular || "—"} · ${cel?.alias ?? "Celular"}${runner}`,
      };
    }),
    ...bancarias.map((b) => ({
      clave: `bancaria:${b.id}`, origen: "bancaria" as const, sourceId: b.id,
      label: `${b.titular || "—"} · Bancaria${b.runner ? ` · ${b.runner}` : ""}`,
    })),
  ];

  return (
    <div style={{ ["--accent" as string]: GM_ACCENT, ["--grad" as string]: GM_GRAD }}>
      <MobileTopBar />
      <div className="cambio-page" style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 900, margin: "0 auto" }}>
        <div className="cambio-head" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cargas</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>Cargas por cuenta y por runner. Elegí un día o un período.</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link href="/cambio" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}>← Volver a la caja</Link>
          </div>
        </div>
        <CargasAdmin
          cargas={cargas} total={total} porCuenta={porCuenta} runners={runners}
          desde={desde} hasta={hasta} cuentasParaCargar={cuentasParaCargar}
        />
      </div>
    </div>
  );
}
