"use client";

import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import Image from "next/image";
import { Lock, LogIn } from "lucide-react";
import { panelAccess } from "@/config/panel-access";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { clearDashboardCache } from "@/dashboard/supabase-provider";

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Acceso al panel. Dos modos:
 * - Con Supabase conectado: login real por email y contraseña (cada
 *   persona del equipo con su propia cuenta, creada en Supabase).
 * - Sin Supabase: candado simple por contraseña compartida (deterrente,
 *   suficiente mientras el panel no muestre datos reales).
 */
export function PanelGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "locked" | "open">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  // --- Modo Supabase: sesión real ---
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "open" : "locked");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) clearDashboardCache();
      setStatus(session ? "open" : "locked");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // --- Modo candado simple (sin base conectada) ---
  useEffect(() => {
    if (isSupabaseConfigured) return;
    if (!panelAccess.enabled) {
      setStatus("open");
      return;
    }
    try {
      const ok = sessionStorage.getItem(panelAccess.sessionKey) === panelAccess.passwordHash;
      setStatus(ok ? "open" : "locked");
    } catch {
      setStatus("locked");
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(false);

    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      const { error: authError } = await supabase!.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(true);
        setPassword("");
      }
      // el onAuthStateChange abre el panel si el login fue correcto
      setBusy(false);
      return;
    }

    const hash = await sha256Hex(password);
    if (hash === panelAccess.passwordHash) {
      try {
        sessionStorage.setItem(panelAccess.sessionKey, hash);
      } catch {
        // sin sessionStorage igual dejamos pasar durante esta vista
      }
      setStatus("open");
    } else {
      setError(true);
      setPassword("");
    }
    setBusy(false);
  }

  if (status === "open") return <>{children}</>;
  if (status === "checking") return <div className="min-h-svh bg-bg" aria-busy="true" />;

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-b from-celeste/50 to-bg px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-border bg-white p-8 text-center shadow-md"
      >
        <Image
          src="/branding/aqua-mar-logo.jpg"
          alt="Logo Aqua Mar"
          width={72}
          height={72}
          className="mx-auto size-18 rounded-full object-cover shadow-xs"
        />
        <h1 className="mt-5 font-display text-xl font-extrabold text-navy">Panel interno</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {isSupabaseConfigured
            ? "Ingresá con tu cuenta del equipo de Aqua Mar."
            : "Acceso restringido al equipo de Aqua Mar."}
        </p>

        {isSupabaseConfigured && (
          <label className="mt-6 grid gap-1.5 text-left text-sm font-bold text-ink" htmlFor="panel-email">
            Email
            <input
              id="panel-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 w-full rounded-2xl border border-border bg-white px-4 text-[15px] text-ink outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgb(0_88_217/0.12)]"
            />
          </label>
        )}

        <label
          className={`${isSupabaseConfigured ? "mt-4" : "mt-6"} grid gap-1.5 text-left text-sm font-bold text-ink`}
          htmlFor="panel-pass"
        >
          Contraseña
          <input
            id="panel-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-14 w-full rounded-2xl border border-border bg-white px-4 text-[15px] text-ink outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_rgb(0_88_217/0.12)]"
          />
        </label>
        {error && (
          <p role="alert" className="mt-2 text-left text-xs font-semibold text-red-600">
            {isSupabaseConfigured
              ? "Email o contraseña incorrectos. Probá de nuevo."
              : "Contraseña incorrecta. Probá de nuevo."}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !password || (isSupabaseConfigured && !email)}
          className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[18px] bg-primary text-[15px] font-bold text-white shadow-sm transition-all hover:bg-primary-hover disabled:opacity-50"
        >
          {isSupabaseConfigured ? <LogIn className="size-4" /> : <Lock className="size-4" />}
          Ingresar
        </button>

        <a href="/" className="mt-4 inline-block text-xs font-bold text-primary hover:underline">
          Volver al sitio
        </a>
      </form>
    </main>
  );
}
