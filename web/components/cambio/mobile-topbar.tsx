"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

const GM_ACCENT = "#D9A84E";

// Barra superior que SOLO se ve en el celular (clase .cambio-mtop, oculta en
// escritorio por CSS). En pantallas chicas la barra lateral se esconde, así que
// esta trae de vuelta lo esencial: el logo de Gestiones MA y el botón de salir.
export function MobileTopBar() {
  const router = useRouter();
  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div
      className="cambio-mtop"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        alignItems: "center",
        gap: 10,
        padding: "11px 14px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(13,13,15,.82)",
        backdropFilter: "blur(16px)",
      }}
    >
      <span style={{ position: "relative", width: 26, height: 32, flex: "none" }}>
        <Image src="/logos/gestiones-mark.png" alt="Gestiones MA" fill sizes="26px" style={{ objectFit: "contain" }} priority />
      </span>
      <span style={{ minWidth: 0 }}>
        <b style={{ fontSize: 13.5, fontWeight: 780, letterSpacing: "-.3px", display: "block", color: "var(--text)" }}>
          Gestiones<span style={{ color: GM_ACCENT }}>MA</span>
        </b>
        <span style={{ fontSize: 9.5, color: "var(--muted)", letterSpacing: ".3px" }}>CAJA DE CAMBIO</span>
      </span>
      <button
        onClick={logout}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        style={{
          marginLeft: "auto",
          background: "var(--card)",
          border: "1px solid var(--border)",
          color: "var(--muted)",
          cursor: "pointer",
          padding: "8px 10px",
          borderRadius: 9,
          display: "grid",
          placeItems: "center",
        }}
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
