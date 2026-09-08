import Image from "next/image";
import { Check } from "lucide-react";
import { content } from "@/data/content";
import { WA_MESSAGES } from "@/lib/whatsapp";
import { Container, Section } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { fadeLeft } from "@/lib/motion";

/** Powerful 3 en 1: foto original + beneficios. */
export function ProductSection() {
  const p = content.product;
  return (
    <Section id="powerful" className="relative overflow-hidden bg-white">
      <div aria-hidden className="absolute left-[-10%] top-24 size-[380px] rounded-full bg-celeste/70 blur-3xl" />
      <Container className="relative grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal variants={fadeLeft} className="order-2 lg:order-1">
          <div className="relative aspect-square w-full overflow-hidden rounded-[36px] shadow-md">
            <Image
              src="/products/powerful-capsula-lavado.webp"
              alt="Cápsula original Powerful 3 en 1 disolviéndose en el lavado: jabón para la ropa, quitamanchas y suavizante"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
            {p.tags.map((t, i) => (
              <span
                key={t}
                className={`glass absolute rounded-full px-3.5 py-1.5 text-xs font-extrabold text-navy shadow-sm ${
                  ["left-4 top-6", "right-4 top-[30%]", "bottom-[14%] left-[16%]"][i]
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-turquesa">
              {p.kicker}
            </p>
            <h2 className="font-display text-[34px] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              {p.title}
            </h2>
            <p className="mt-5 max-w-md text-lg text-ink-soft">{p.text}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-8 grid gap-3">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="inline-flex size-6 flex-none items-center justify-center rounded-full bg-turquesa/15 text-turquesa">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="font-semibold text-ink/85">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9">
              <WhatsAppLink message={WA_MESSAGES.wholesale} location="product" intent="wholesale">
                {p.cta}
              </WhatsAppLink>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
