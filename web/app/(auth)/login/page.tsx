"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Mail, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginInner() {
  const params = useSearchParams();
  const denied = params.get("denied");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: true },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", width: 560, height: 560, borderRadius: "50%", filter: "blur(130px)", background: "var(--g2)", opacity: 0.14, top: -180, left: -80, pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 520, height: 520, borderRadius: "50%", filter: "blur(130px)", background: "var(--g4)", opacity: 0.1, bottom: -200, right: -60, pointerEvents: "none" }} />

      <div style={{ width: 400, maxWidth: "100%", background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border-2)", borderRadius: 22, padding: 30, position: "relative", boxShadow: "0 30px 80px -30px #000" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
          <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-2px" }}>
            i<span className="gt">G</span>
          </span>
          <span>
            <b style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", display: "block" }}>INICIATIVA GLOBAL</b>
            <span style={{ fontSize: 11, color: "var(--faint)", letterSpacing: "1px" }}>CRM · Centro de operaciones</span>
          </span>
        </div>

        {status === "sent" ? (
          <div>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: "var(--grad)", display: "grid", placeItems: "center", color: "#fff", marginBottom: 16 }}>
              <Mail size={22} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 750, margin: "0 0 8px", letterSpacing: "-.4px" }}>Revisá tu email</h1>
            <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
              Te enviamos un enlace de acceso a <b style={{ color: "var(--text)" }}>{email}</b>. Abrilo <b style={{ color: "var(--text)" }}>desde este mismo navegador</b> para entrar.
            </p>
            <button onClick={() => setStatus("idle")} style={{ marginTop: 20, background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Usar otro email
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 21, fontWeight: 760, margin: "0 0 6px", letterSpacing: "-.5px" }}>Ingresá a tu CRM</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 22px" }}>Te mandamos un enlace por email. Sin contraseñas.</p>

            {denied && (
              <div style={{ background: "rgba(255,107,107,.12)", border: "1px solid rgba(255,107,107,.3)", color: "#ff8585", borderRadius: 11, padding: "10px 12px", fontSize: 12.5, marginBottom: 14 }}>
                No pudimos iniciar sesión con ese email (o no tiene acceso). Probá de nuevo.
              </div>
            )}

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "13px 14px", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              />
              {status === "error" && <div style={{ fontSize: 12, color: "#ff8585" }}>{error}</div>}
              <button
                type="submit"
                disabled={status === "sending"}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--grad)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: status === "sending" ? "default" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}
              >
                {status === "sending" ? "Enviando…" : (<><Sparkles size={16} /> Enviarme el enlace <ArrowRight size={16} /></>)}
              </button>
            </form>
          </>
        )}
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
