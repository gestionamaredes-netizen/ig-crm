import { content } from "@/data/content";
import { WA_MESSAGES } from "@/lib/whatsapp";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { Bubbles } from "@/components/ui/Bubbles";

/** CTA final sobre agua: pedir por WhatsApp o consultar por mayor. */
export function FinalCTA() {
  const cta = content.finalCta;
  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden bg-gradient-to-br from-navy via-primary to-turquesa py-24">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute left-1/4 top-[-20%] size-[500px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-30%] right-[10%] size-[560px] rounded-full bg-turquesa/30 blur-3xl" />
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

      <Container className="relative text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl font-display text-[38px] font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl">
            {cta.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">{cta.text}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <WhatsAppLink
              message={WA_MESSAGES.retail}
              location="final_cta"
              intent="retail"
              variant="white"
            >
              {cta.ctaPrimary}
            </WhatsAppLink>
            <a
              href="#mayoristas"
              className="inline-flex min-h-[52px] items-center justify-center rounded-[18px] border-2 border-white/40 px-8 text-[15px] font-bold text-white backdrop-blur transition-all hover:scale-[1.02] hover:border-white"
            >
              {cta.ctaSecondary}
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
