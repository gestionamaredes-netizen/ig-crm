import { getMiPerfil } from "@/lib/cambio/perfiles-datos";
import { getCelulares, getCuentasOperativas } from "@/lib/cambio/celulares-datos";
import { PanelCelulares } from "@/components/cambio/panel-celulares";

export const dynamic = "force-dynamic";

const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};

export default async function PanelPage() {
  // RLS filtra celulares/cuentas al runner logueado: no hace falta pasar runnerId.
  const [perfil, celulares, cuentas] = await Promise.all([
    getMiPerfil(),
    getCelulares(),
    getCuentasOperativas(),
  ]);

  return (
    <div style={{ ["--accent" as string]: GM_ACCENT, ["--grad" as string]: GM_GRAD }}>
      <div style={{ padding: "26px 22px 40px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, margin: "0 auto" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>
            Hola{perfil?.runnerNombre ? `, ${perfil.runnerNombre}` : ""}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
            Tus celulares y cuentas de Gestiones MA.
          </p>
        </div>

        {!perfil?.runnerId ? (
          <div style={panel}>
            <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0 }}>
              Tu usuario todavía no está vinculado a un runner. Avisale a Capi para que te habilite.
            </p>
          </div>
        ) : (
          <div style={panel}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px" }}>Mis celulares y cuentas</h2>
            <PanelCelulares celulares={celulares} cuentas={cuentas} />
          </div>
        )}
      </div>
    </div>
  );
}
