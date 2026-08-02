"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/analytics/track-event";
import { WhatsAppIcon } from "./icons";

const styles = {
  primary:
    "bg-primary text-white shadow-sm hover:scale-[1.02] hover:bg-primary-hover hover:shadow-md active:bg-primary-active",
  secondary:
    "border-2 border-primary/25 bg-white text-primary hover:scale-[1.02] hover:border-primary hover:bg-celeste/40",
  white:
    "bg-white text-navy shadow-md hover:scale-[1.02] hover:shadow-glow",
  turquesa:
    "bg-turquesa text-navy hover:scale-[1.02] hover:shadow-glow",
};

/**
 * Botón de WhatsApp con URL construida en el cliente (incluye UTM) y
 * evento whatsapp_click centralizado. Si el número no está configurado,
 * el botón queda deshabilitado en lugar de apuntar a un link roto.
 */
export function WhatsAppLink({
  message,
  location,
  intent = "general",
  variant = "primary",
  withIcon = true,
  className = "",
  children,
}: {
  message: string;
  location: string;
  intent?: string;
  variant?: keyof typeof styles;
  withIcon?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    setHref(getWhatsAppUrl(message));
  }, [message]);

  return (
    <a
      href={href ?? undefined}
      target="_blank"
      rel="noopener"
      aria-disabled={href === null}
      onClick={() =>
        trackEvent({
          name: "whatsapp_click",
          category: "contact",
          params: { location, intent },
        })
      }
      className={`inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[18px] px-8 text-[15px] font-bold transition-all duration-200 ${styles[variant]} ${href === null ? "pointer-events-none opacity-60" : ""} ${className}`}
    >
      {withIcon && <WhatsAppIcon className="size-5" />}
      {children}
    </a>
  );
}
