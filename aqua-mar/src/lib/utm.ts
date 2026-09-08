/**
 * Atribución de campañas. Al entrar con parámetros UTM se guardan en
 * sessionStorage; los mensajes de WhatsApp agregan la campaña de origen
 * sin mostrar parámetros técnicos ni valores vacíos.
 */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const STORAGE_KEY = "aquamar_utm";

export function captureUtm(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) found[k] = v;
    });
    if (Object.keys(found).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
  } catch {
    // sessionStorage no disponible: la atribución simplemente se omite
  }
}

export function getStoredUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Sufijo legible para mensajes de WhatsApp. Vacío si no hay campaña. */
export function getUtmSuffix(): string {
  const utm = getStoredUtm();
  return utm.utm_campaign ? `\n\n(Llegué desde la campaña ${utm.utm_campaign})` : "";
}
