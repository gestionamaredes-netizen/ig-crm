"use client";

import { useEffect, useState } from "react";
import { getConsent, saveConsent } from "./consent-store";

/** Panel de preferencias para la página /cookies. */
export function CookieSettings() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = getConsent();
    setAnalytics(c.analytics);
    setMarketing(c.marketing);
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-white p-6">
      <div className="grid gap-3 text-[15px]">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="font-bold text-ink">Necesarias</span>
            <span className="block text-sm text-ink-soft">
              Imprescindibles para que el sitio funcione.
            </span>
          </span>
          <input type="checkbox" checked disabled className="size-5 accent-primary" />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="font-bold text-ink">Analítica</span>
            <span className="block text-sm text-ink-soft">
              Nos ayuda a entender cómo se usa el sitio.
            </span>
          </span>
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="size-5 accent-primary"
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="font-bold text-ink">Marketing</span>
            <span className="block text-sm text-ink-soft">
              Permite medir campañas publicitarias.
            </span>
          </span>
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="size-5 accent-primary"
          />
        </label>
      </div>
      <button
        onClick={() => {
          saveConsent({ analytics, marketing });
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }}
        className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
      >
        Guardar preferencias
      </button>
      {saved && (
        <p role="status" className="mt-3 text-sm font-semibold text-turquesa">
          Preferencias guardadas.
        </p>
      )}
    </div>
  );
}
