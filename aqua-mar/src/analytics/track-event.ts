"use client";

import { analyticsConfig } from "@/config/analytics";
import { getConsent } from "@/components/consent/consent-store";

type TrackEventInput = {
  name: string;
  category?: string;
  label?: string;
  value?: number;
  params?: Record<string, string | number>;
};

declare global {
  interface Window {
    dataLayer?: object[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Capa única de tracking. Los componentes llaman trackEvent() y esta
 * función decide a qué plataformas reportar según configuración y
 * consentimiento. Sin IDs configurados no hace nada (salvo log en dev).
 */
export function trackEvent({ name, category, label, value, params }: TrackEventInput): void {
  if (typeof window === "undefined") return;
  const consent = getConsent();
  const payload = {
    event_category: category,
    event_label: label,
    value,
    ...params,
  };

  if (process.env.NODE_ENV === "development") {
    console.debug("[trackEvent]", name, payload);
  }

  if (consent.analytics) {
    if (analyticsConfig.googleTagManagerId && window.dataLayer) {
      window.dataLayer.push({ event: name, ...payload });
    }
    if (analyticsConfig.googleAnalyticsId && window.gtag) {
      window.gtag("event", name, payload);
    }
  }

  if (consent.marketing && analyticsConfig.metaPixelId && window.fbq) {
    window.fbq("trackCustom", name, payload);
  }
}
