import {
  Package,
  Archive,
  CalendarCheck,
  ShieldCheck,
  Truck,
  HeartHandshake,
} from "lucide-react";
import { content } from "@/data/content";
import { Container, Section, SectionTitle } from "@/components/ui/primitives";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Reveal } from "@/components/ui/Reveal";

const ICONS = [Package, Archive, CalendarCheck, ShieldCheck, Truck, HeartHandshake];

/** Grilla de seis beneficios. */
export function Benefits() {
  const b = content.benefits;
  return (
    <Section id="beneficios" className="bg-white">
      <Container>
        <Reveal>
          <SectionTitle kicker={b.kicker} title={b.title} />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {b.items.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.08}>
              <FeatureCard icon={ICONS[i % ICONS.length]} title={item.title}>
                {item.text}
              </FeatureCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
