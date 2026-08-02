import { Boxes, TrendingUp, Truck } from "lucide-react";
import { content } from "@/data/content";
import { Container, Section } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { WholesaleForm } from "./WholesaleForm";

const PERKS = [
  { icon: Boxes, text: "Productos originales para tu catálogo" },
  { icon: TrendingUp, text: "Condiciones comerciales según volumen" },
  { icon: Truck, text: "Despacho coordinado a tu localidad" },
];

/** Sección mayorista: propuesta + formulario. */
export function WholesaleSection() {
  const w = content.wholesale;
  return (
    <Section
      id="mayoristas"
      className="relative overflow-hidden bg-gradient-to-br from-celeste/60 via-bg to-turquesa/10"
    >
      <div aria-hidden className="absolute right-[-12%] top-10 size-[420px] rounded-full bg-turquesa/15 blur-3xl" />
      <Container className="relative grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-turquesa">
              {w.kicker}
            </p>
            <h2 className="font-display text-[34px] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              ¿Querés incorporar <span className="text-primary">Powerful</span> a tu negocio?
            </h2>
            <p className="mt-5 max-w-md text-lg text-ink-soft">{w.text}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-8 grid gap-4">
              {PERKS.map((p) => (
                <li key={p.text} className="flex items-center gap-3.5">
                  <span className="inline-flex size-11 flex-none items-center justify-center rounded-2xl bg-white text-primary shadow-xs">
                    <p.icon className="size-5" strokeWidth={2} />
                  </span>
                  <span className="font-semibold text-ink/85">{p.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <WholesaleForm />
        </Reveal>
      </Container>
    </Section>
  );
}
