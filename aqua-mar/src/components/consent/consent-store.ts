"use client";

/** Preferencias de cookies guardadas en localStorage. */
export type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
};

const KEY = "aquamar_consent_v1";

export const DEFAULT_CONSENT: Consent = {
  necessary: true,
  analytics: false,
  marketing: false,
  decided: false,
};

export function getConsent(): Consent {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONSENT;
    return { ...DEFAULT_CONSENT, ...JSON.parse(raw), necessary: true };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function saveConsent(consent: Omit<Consent, "necessary" | "decided">): Consent {
  const full: Consent = { necessary: true, decided: true, ...consent };
  try {
    localStorage.setItem(KEY, JSON.stringify(full));
    window.dispatchEvent(new CustomEvent("aquamar-consent", { detail: full }));
  } catch {
    // localStorage no disponible
  }
  return full;
}
