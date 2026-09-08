"use client";

import { useEffect, useState } from "react";
import { content } from "@/data/content";
import { getWhatsAppUrl, WA_MESSAGES } from "@/lib/whatsapp";
import { trackEvent } from "@/analytics/track-event";
import { WhatsAppIcon } from "@/components/ui/icons";

/** Botón flotante de 64px con tooltip "¿Necesitás ayuda?". */
export function FloatingWhatsApp() {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    setHref(getWhatsAppUrl(WA_MESSAGES.general));
  }, []);

  if (!href) return null;

  return (
    <div className="group fixed bottom-5 right-5 z-50 flex items-center gap-3">
      <span
        role="tooltip"
        className="pointer-events-none translate-x-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white opacity-0 shadow-md transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 max-sm:hidden"
      >
        {content.whatsappTooltip}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        aria-label={`WhatsApp: ${content.whatsappTooltip}`}
        onClick={() =>
          trackEvent({
            name: "whatsapp_click",
            category: "contact",
            params: { location: "floating_button", intent: "general" },
          })
        }
        className="inline-flex size-16 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_12px_32px_-8px_rgb(37_211_102/0.6)] transition-transform hover:scale-110"
      >
        <span
          aria-hidden
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366]/40 [animation-duration:2.8s]"
        />
        <WhatsAppIcon className="size-8" />
      </a>
    </div>
  );
}
