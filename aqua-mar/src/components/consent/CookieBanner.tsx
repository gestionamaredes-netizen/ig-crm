"use client";

import { useEffect, useState } from "react";
import { getConsent, saveConsent } from "./consent-store";

/**
 * Banner de consentimiento liviano con tres categorías. Las cookies
 * necesarias siempre quedan activas; analítica y marketing esperan la
 * decisión del usuario. La preferencia se puede cambiar desde /cookies.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    setVisible(!getConsent().decided);
  }, []);

  if (!visible) return null;

  const close = () => setVisible(false);

  return (
    <div
      role="dialog"
      aria-label="Preferencias de cookies"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl rounded-3xl border border-border bg-white p-5 shadow-xl sm:inset-x-auto sm:right-5 sm:bottom-5"
    >
      <p className="text-sm font-bold text-ink">Cookies</p>
      <p className="mt-1 text-sm text-ink-soft">
        Usamos cookies para mejorar la experiencia y medir el rendimiento del
        sitio. Podés aceptar todas, rechazarlas o configurar tus preferencias.
      </p>

      {settings && (
        <div className="mt-3 grid gap-2 rounded-2xl bg-mist p-3 text-sm">
          <label className="flex items-center justify-between gap-3">
            <span className="font-semibold text-ink">Necesarias</span>
            <input type="checkbox" checked disabled className="size-4 accent-primary" />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-ink">Analítica</span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="size-4 accent-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-ink">Marketing</span>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="size-4 accent-primary"
            />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            saveConsent({ analytics: true, marketing: true });
            close();
          }}
          className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
        >
          Aceptar todas
        </button>
        <button
          onClick={() => {
            saveConsent({ analytics: false, marketing: false });
            close();
          }}
          className="rounded-full border border-border px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-mist"
        >
          Rechazar opcionales
        </button>
        {settings ? (
          <button
            onClick={() => {
              saveConsent({ analytics, marketing });
              close();
            }}
            className="rounded-full px-4 py-2 text-sm font-bold text-primary hover:bg-celeste/50"
          >
            Guardar preferencias
          </button>
        ) : (
          <button
            onClick={() => setSettings(true)}
            className="rounded-full px-4 py-2 text-sm font-bold text-primary hover:bg-celeste/50"
          >
            Configurar
          </button>
        )}
      </div>
    </div>
  );
}
