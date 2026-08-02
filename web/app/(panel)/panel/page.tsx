import { getMiPerfil } from "@/lib/cambio/perfiles-datos";
import { getCelulares, getCuentasOperativas } from "@/lib/cambio/celulares-datos";
import { getCuentas } from "@/lib/cambio/cuentas-datos";
import { getCargasDelDia } from "@/lib/cambio/cargas-datos";
import { hoyISO } from "@/lib/cambio/datos";
import { PanelCelulares } from "@/components/cambio/panel-celulares";
import { CambiarPasswordButton } from "@/components/cambio/cambiar-password";
import { CargasRunner, type CuentaDelRunner } from "@/components/cambio/cargas-runner";

export const dynamic = "force-dynamic";

const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};

export default async function PanelPage() {
  // RLS filtra celulares/cuentas al runner logueado: no hace falta pasar runnerId.
  const hoy = hoyISO();
  const [perfil, celulares, operativas, bancarias, cargasHoy] = await Promise.all([
    getMiPerfil(),
    getCelulares(),
    getCuentasOperativas(),
    getCuentas(),
    getCargasDelDia(hoy),
  ]);

  // Lista unificada de cuentas del runner para las cargas (solo datos serializables).
  const cuentasDelRunner: CuentaDelRunner[] = [
    ...operativas.map((o) => ({
      clave: `operativa:${o.id}`, origen: "operativa" as const, sourceId: o.id,
      titular: o.titular, etiqueta: celulares.find((cel) => cel.id === o.celularId)?.alias ?? "Celular",
    })),
    ...bancarias.map((b) => ({
      clave: `bancaria:${b.id}`, origen: "bancaria" as const, sourceId: b.id,
      titular: b.titular, etiqueta: "Bancaria",
    })),
  ];

  return (
    <div style={{ ["--accent" as string]: GM_ACCENT, ["--grad" as string]: GM_GRAD }}>
      <div style={{ padding: "26px 22px 40px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>
              Hola{perfil?.runnerNombre ? `, ${perfil.runnerNombre}` : ""}
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
              Tus celulares y cuentas de Gestiones MA.
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <CambiarPasswordButton />
          </div>
        </div>

        {!perfil?.runnerId ? (
          <div style={panel}>
            <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0 }}>
              Tu usuario todavía no está vinculado a un runner. Avisale a Capi para que te habilite.
            </p>
          </div>
        ) : (
          <>
            <CargasRunner cuentas={cuentasDelRunner} cargasHoy={cargasHoy} fecha={hoy} />
            <div style={panel}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px" }}>Mis celulares y cuentas</h2>
              <PanelCelulares celulares={celulares} cuentas={operativas} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
