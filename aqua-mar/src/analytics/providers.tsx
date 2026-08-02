"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { analyticsConfig } from "@/config/analytics";
import { getConsent, type Consent } from "@/components/consent/consent-store";
import { captureUtm } from "@/lib/utm";

/**
 * Carga condicional de herramientas de analítica y marketing.
 * Cada script se inyecta solo si su ID existe Y el usuario dio
 * consentimiento para esa categoría.
 */
export function AnalyticsProviders() {
  const [consent, setConsent] = useState<Consent | null>(null);

  useEffect(() => {
    captureUtm();
    setConsent(getConsent());
    const onChange = (e: Event) => setConsent((e as CustomEvent<Consent>).detail);
    window.addEventListener("aquamar-consent", onChange);
    return () => window.removeEventListener("aquamar-consent", onChange);
  }, []);

  if (!consent) return null;

  const { googleAnalyticsId, googleTagManagerId, metaPixelId } = analyticsConfig;

  return (
    <>
      {consent.analytics && googleTagManagerId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagManagerId}');`}
        </Script>
      )}
      {consent.analytics && googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAnalyticsId}');`}
          </Script>
        </>
      )}
      {consent.marketing && metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
