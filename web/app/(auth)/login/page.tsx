"use client";
import { useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Lock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FULL_ACCESS, accessTier, landingPath } from "@/lib/auth-config";

// Un mismo login para dos deploys. Si este deploy otorga acceso completo a
// alguien (NEXT_PUBLIC_FULL_ACCESS no vacío), es el CRM y se marca como IG CRM;
// si no, es la caja de cambio y se marca Gestiones MA. Sin env → cambio, igual
// que antes.
const ES_CRM = FULL_ACCESS.length > 0;

// El equipo entra con un USUARIO (ej. "Capi"), no con un email. Supabase Auth
// trabaja con emails, así que el usuario se mapea a un email interno del
// dominio de la caja. "Capi" → "capi@gestionesma.store". Ese email no recibe
// correo: solo autentica. Debe estar en el allowlist (lib/auth-config.ts).
const DOMINIO_USUARIO = "gestionesma.store";
function usuarioAEmail(usuario: string): string {
  return `${usuario.trim().toLowerCase().replace(/\s+/g, "")}@${DOMINIO_USUARIO}`;
}

// Branding Gestiones MA (dorado). La app es exclusiva de la caja de cambio, así
// que el login también es Gestiones MA en vez del CRM general.
const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

const inputStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "13px 14px 13px 40px",
  color: "var(--text)",
  // 16px evita que iOS haga zoom al enfocar el campo en el celular.
  fontSize: 16,
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
};

function LoginInner() {
  const params = useSearchParams();
  const denied = params.get("denied");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "entrando" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("entrando");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: usuarioAEmail(usuario),
      password,
    });
    if (error) {
      setStatus("error");
      // El mensaje de Supabase viene en inglés ("Invalid login credentials");
      // se muestra uno claro en español en su lugar.
      setError("Usuario o contraseña incorrectos.");
    } else {
      // A dónde entra depende de su nivel: acceso completo → /dashboard;
      // solo-caja → /cambio. Antes estaba clavado en /cambio, lo que dejaba al
      // dueño del CRM parado en la caja. Navegación completa para que el
      // middleware vea la sesión recién guardada en las cookies.
      window.location.assign(landingPath(accessTier(usuarioAEmail(usuario))));
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", width: 560, height: 560, borderRadius: "50%", filter: "blur(130px)", background: "var(--g2)", opacity: 0.14, top: -180, left: -80, pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 520, height: 520, borderRadius: "50%", filter: "blur(130px)", background: "var(--g4)", opacity: 0.1, bottom: -200, right: -60, pointerEvents: "none" }} />

      <div
        style={{
          width: 400,
          maxWidth: "100%",
          background: "var(--glass)",
          backdropFilter: "blur(16px)",
          border: "1px solid var(--border-2)",
          borderRadius: 22,
          padding: 30,
          position: "relative",
          boxShadow: "0 30px 80px -30px #000",
          // Gestiones MA pisa el acento a dorado; el CRM usa el gradiente por defecto.
          ...(ES_CRM ? {} : { ["--accent" as string]: GM_ACCENT, ["--grad" as string]: GM_GRAD }),
        }}
      >
        {ES_CRM ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
            <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1 }}>
              i<span className="gt">G</span>
            </span>
            <span>
              <b style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", display: "block", color: "var(--text)" }}>INICIATIVA</b>
              <b style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", display: "block", color: "var(--muted)" }}>GLOBAL</b>
            </span>
            <span style={{ marginLeft: 2, fontSize: 9, fontWeight: 800, letterSpacing: "1px", padding: "2px 6px", borderRadius: 6, background: "var(--grad)", color: "#fff", alignSelf: "flex-start" }}>
              CRM
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 26 }}>
            <span style={{ position: "relative", width: 40, height: 47, flex: "none" }}>
              <Image src="/logos/gestiones-mark.png" alt="Gestiones MA" fill sizes="40px" style={{ objectFit: "contain" }} priority />
            </span>
            <span>
              <b style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.4px", display: "block" }}>
                Gestiones<span style={{ color: GM_ACCENT }}>MA</span>
              </b>
              <span style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "1px" }}>CAJA DE CAMBIO</span>
            </span>
          </div>
        )}

        <h1 style={{ fontSize: 21, fontWeight: 760, margin: "0 0 6px", letterSpacing: "-.5px" }}>
          {ES_CRM ? "Ingresá a tu CRM" : "Ingresá a la caja"}
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 22px" }}>Entrá con tu usuario y contraseña.</p>

        {denied && (
          <div style={{ background: "rgba(255,107,107,.12)", border: "1px solid rgba(255,107,107,.3)", color: "#ff8585", borderRadius: 11, padding: "10px 12px", fontSize: 12.5, marginBottom: 14 }}>
            {ES_CRM ? "Ese usuario no tiene acceso al CRM." : "Ese usuario no tiene acceso a la caja."}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }} />
            <input
              type="text"
              required
              autoComplete="username"
              autoCapitalize="none"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Usuario"
              style={inputStyle}
            />
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }} />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              style={inputStyle}
            />
          </div>
          {status === "error" && <div style={{ fontSize: 12.5, color: "#ff8585" }}>{error}</div>}
          <button
            type="submit"
            disabled={status === "entrando"}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--grad)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: status === "entrando" ? "default" : "pointer", opacity: status === "entrando" ? 0.7 : 1 }}
          >
            {status === "entrando" ? "Entrando…" : (<>Entrar <ArrowRight size={16} /></>)}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
