import { Truck, Package, MapPin } from "lucide-react";
import { content } from "@/data/content";
import { WA_MESSAGES } from "@/lib/whatsapp";
import { Container, Section, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { Bubbles } from "@/components/ui/Bubbles";
import { ArgentinaMap } from "@/components/ui/ArgentinaMap";

const LOCALIDADES = [
  { name: "San Miguel", pos: "left-[58%] top-[8%]" },
  { name: "Moreno", pos: "left-[6%] top-[26%]" },
  { name: "Hurlingham", pos: "left-[64%] top-[36%]" },
  { name: "Merlo", pos: "left-[10%] top-[62%]" },
  { name: "Ituzaingó", pos: "left-[34%] top-[84%]" },
  { name: "Morón", pos: "left-[68%] top-[68%]" },
  { name: "Ramos Mejía", pos: "left-[72%] top-[48%]" },
  { name: "Castelar", pos: "left-[22%] top-[42%]" },
];

const NATIONAL_FEATURES = [
  { icon: Truck, label: "Transporte a todo el país" },
  { icon: Package, label: "Embalaje seguro" },
  { icon: MapPin, label: "Seguimiento del envío" },
];

/** Cobertura: Zona Oeste + todo el país. */
export function Coverage() {
  const cov = content.coverage;
  return (
    <Section id="cobertura" className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -left-32 top-0 size-[460px] rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -right-32 bottom-0 size-[460px] rounded-full bg-turquesa/20 blur-3xl" />
      </div>
      <Bubbles light />

      <Container className="relative">
        <Reveal>
          <SectionTitle kicker={cov.kicker} title={cov.title} text={cov.text} dark />
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="glass-dark h-full rounded-3xl p-8 sm:p-10">
              <div className="mb-2 flex items-center gap-2 text-turquesa">
                <MapPin className="size-5" />
                <span className="text-xs font-extrabold uppercase tracking-[0.16em]">
                  Zona Oeste
                </span>
              </div>
              <h3 className="font-display text-2xl font-extrabold sm:text-3xl">
                {cov.local.title}
              </h3>
              <p className="mt-3 text-white/70">{cov.local.text}</p>

              <div className="relative mx-auto mt-8 aspect-square max-w-sm">
                <div aria-hidden className="absolute inset-0">
                  <div className="absolute inset-0 rounded-full border border-turquesa/20" />
                  <div className="absolute inset-[16%] rounded-full border border-turquesa/25" />
                  <div className="absolute inset-[32%] rounded-full border border-turquesa/30" />
                  <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-turquesa shadow-glow" />
                  <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-turquesa/25 [animation-duration:2.6s]" />
                </div>
                {LOCALIDADES.map((l) => (
                  <span
                    key={l.name}
                    className={`absolute ${l.pos} whitespace-nowrap rounded-full bg-turquesa/90 px-3 py-1 text-[11px] font-extrabold text-navy shadow-sm`}
                  >
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="glass-dark flex h-full flex-col rounded-3xl p-8 sm:p-10">
              <div className="mb-2 flex items-center gap-2 text-turquesa">
                <Truck className="size-5" />
                <span className="text-xs font-extrabold uppercase tracking-[0.16em]">
                  Todo el país
                </span>
              </div>
              <h3 className="font-display text-2xl font-extrabold sm:text-3xl">
                {cov.national.title}
              </h3>
              <p className="mt-3 text-white/70">{cov.national.text}</p>

              <div className="my-6 flex-1">
                <ArgentinaMap />
              </div>

              <ul className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                {NATIONAL_FEATURES.map((f) => (
                  <li key={f.label} className="flex flex-col items-center gap-2 text-center">
                    <f.icon className="size-6 text-turquesa" strokeWidth={1.9} />
                    <span className="text-xs font-semibold text-white/75">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mt-10 text-center">
          <WhatsAppLink
            message={WA_MESSAGES.coverage}
            location="coverage"
            intent="coverage"
            variant="turquesa"
          >
            {cov.cta}
          </WhatsAppLink>
        </Reveal>
      </Container>
    </Section>
  );
}
