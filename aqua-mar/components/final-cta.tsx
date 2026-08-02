import { waLink, WA_MESSAGES } from "@/lib/wa";
import { Reveal } from "./reveal";
import { WhatsAppIcon } from "./whatsapp-icon";
import { Bubbles } from "./bubbles";

export function FinalCta() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden bg-gradient-to-br from-deep via-brand to-mar py-24">
      {/* Agua: ondas y luz */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute left-1/4 top-[-20%] size-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-30%] right-[10%] size-[560px] rounded-full bg-mar/30 blur-3xl" />
        <svg
          className="absolute bottom-0 left-0 w-full opacity-20"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 C240,180 480,60 720,100 C960,140 1200,60 1440,110 L1440,200 L0,200 Z"
            fill="#ffffff"
          />
          <path
            d="M0,150 C260,200 520,110 780,140 C1040,170 1240,110 1440,150 L1440,200 L0,200 Z"
            fill="#ffffff"
            opacity="0.6"
          />
        </svg>
      </div>
      <Bubbles light />

      <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-6">
        <Reveal>
          <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Hacé tu próximo lavado
            <br />
            mucho más simple.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
            Escribinos y recibí Powerful en tu casa o en tu comercio, estés
            donde estés.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href={waLink(WA_MESSAGES.pedido)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-bold text-deep shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <WhatsAppIcon className="size-5 text-[#25d366]" />
              Pedir por WhatsApp
            </a>
            <a
              href="#mayoristas"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-4 text-[15px] font-bold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:border-white"
            >
              Consultar por mayor
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
