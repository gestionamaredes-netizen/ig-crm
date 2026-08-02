import { content } from "@/data/content";
import { Container, Section, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";

/** Tres pasos para empezar. */
export function HowItWorks() {
  const how = content.howItWorks;
  return (
    <Section className="bg-gradient-to-b from-white to-celeste/40">
      <Container>
        <Reveal>
          <SectionTitle kicker={how.kicker} title={how.title} />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {how.steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-white p-8 shadow-xs transition-transform duration-300 hover:-translate-y-1.5">
                <span
                  aria-hidden
                  className="absolute -right-3 -top-6 font-display text-[104px] font-extrabold leading-none text-celeste transition-colors group-hover:text-turquesa/15"
                >
                  {i + 1}
                </span>
                <span className="relative inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-turquesa font-display text-xl font-extrabold text-white">
                  {i + 1}
                </span>
                <h3 className="relative mt-5 font-display text-xl font-extrabold text-ink">
                  {s.title}
                </h3>
                <p className="relative mt-2 text-[15px] text-ink-soft">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.25}>
          <p className="mt-8 text-center text-xs text-ink-soft/80">{how.note}</p>
        </Reveal>
      </Container>
    </Section>
  );
}
