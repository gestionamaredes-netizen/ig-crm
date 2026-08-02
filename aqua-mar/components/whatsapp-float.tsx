import { waLink, WA_MESSAGES } from "@/lib/wa";
import { WhatsAppIcon } from "./whatsapp-icon";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink(WA_MESSAGES.consulta)}
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_-6px_rgb(37_211_102/0.6)] transition-transform hover:scale-110"
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366]/40 [animation-duration:2.8s]"
      />
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
