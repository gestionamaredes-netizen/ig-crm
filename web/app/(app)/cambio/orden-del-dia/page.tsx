import Link from "next/link";
import { getOrdenDelDia, getCargaAuditoria } from "@/lib/cambio/orden-del-dia-datos";
import { getCuentas } from "@/lib/cambio/cuentas-datos";
import { getRunners } from "@/lib/cambio/runners-datos";
import { getMiPerfil } from "@/lib/cambio/perfiles-datos";
import { hoyISO } from "@/lib/cambio/datos";
import { OrdenDelDiaPanel } from "@/components/cambio/orden-del-dia";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";

export const dynamic = "force-dynamic";

export default async function OrdenDelDiaPage() {
  const hoy = hoyISO();
  let registros, auditoria, cuentas, runners, perfil;

  try {
    [registros, auditoria, cuentas, runners, perfil] = await Promise.all([
      getOrdenDelDia(hoy),
      getCargaAuditoria(hoy),
      getCuentas(),
      getRunners(),
      getMiPerfil(),
    ]);
  } catch (err) {
    console.error("[orden-del-dia] Error cargando datos:", err);
    return (
      <div style={{ background: "white", minHeight: "100vh" }}>
        <MobileTopBar />
        <div style={{ padding: "26px 30px 40px" }}>
          <p style={{ color: "#666" }}>Error al cargar los datos. Intenta de nuevo.</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div style={{ background: "white", minHeight: "100vh" }}>
        <MobileTopBar />
        <div style={{ padding: "26px 30px 40px" }}>
          <p style={{ color: "#666" }}>No tiene acceso.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      <MobileTopBar />
      <div style={{ padding: "26px 30px 40px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 780, margin: 0 }}>Orden del Día</h1>
            <p style={{ fontSize: 13, color: "#666", margin: "5px 0 0" }}>Cuentas y auditoría</p>
          </div>
          <Link href="/cambio" style={{ marginLeft: "auto", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#111" }}>
            Volver
          </Link>
        </div>
        <OrdenDelDiaPanel registros={registros} auditoria={auditoria} cuentas={cuentas} runners={runners} perfil={perfil} />
      </div>
    </div>
  );
}
