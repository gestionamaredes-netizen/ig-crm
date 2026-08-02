"use client";

import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import { panelAccess } from "@/config/panel-access";

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Candado de acceso del panel: pide contraseña una vez por sesión. */
export function PanelGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "locked" | "open">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
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
          Acceso restringido al equipo de Aqua Mar.
        </p>

        <label className="mt-6 grid gap-1.5 text-left text-sm font-bold text-ink" htmlFor="panel-pass">
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
            Contraseña incorrecta. Probá de nuevo.
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[18px] bg-primary text-[15px] font-bold text-white shadow-sm transition-all hover:bg-primary-hover disabled:opacity-50"
        >
          <Lock className="size-4" />
          Ingresar
        </button>

        <a href="/" className="mt-4 inline-block text-xs font-bold text-primary hover:underline">
          Volver al sitio
        </a>
      </form>
    </main>
  );
}
