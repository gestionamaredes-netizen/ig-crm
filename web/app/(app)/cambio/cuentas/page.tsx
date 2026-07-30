import Link from "next/link";
import { getCuentas } from "@/lib/cambio/cuentas-datos";
import { getDatosCambio, hoyISO } from "@/lib/cambio/datos";
import { rankingPersonas } from "@/lib/cambio/reportes";
import { CuentasLista } from "@/components/cambio/cuentas-lista";
import { NuevaCuentaBancariaButton } from "@/components/cambio/cuenta-forms";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";

export const dynamic = "force-dynamic";

// Mismo branding dorado de Gestiones MA que el resto de la caja de cambio
// (ver web/app/(app)/cambio/page.tsx). Las cuentas bancarias son parte de
// esa misma herramienta.
const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

export default async function CuentasPage() {
  const [cuentas, { operaciones }] = await Promise.all([
    getCuentas(),
    getDatosCambio(hoyISO()),
  ]);
  const movimientos = rankingPersonas(operaciones);

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
            <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cuentas</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
              Cuentas bancarias de titulares y su movimiento como emisor/receptor.
            </p>
          </div>
          <div className="cambio-head-actions" style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <Link
              href="/cambio"
              style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
            >
              Volver a Cambio
            </Link>
            <NuevaCuentaBancariaButton />
          </div>
        </div>

        <div style={panel}>
          <CuentasLista cuentas={cuentas} movimientos={movimientos} />
        </div>
      </div>
    </div>
  );
}
