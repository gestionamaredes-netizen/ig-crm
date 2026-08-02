import {
  Shirt,
  Clock,
  Package,
  Palette,
  Wind,
  Archive,
} from "lucide-react";
import { Reveal } from "./reveal";

const BENEFITS = [
  {
    icon: Shirt,
    title: "Ropa limpia e impecable",
    text: "Limpieza profunda en cada ciclo, sin restos de jabón.",
  },
  {
    icon: Clock,
    title: "Ahorrás tiempo",
    text: "Nada de medir ni dosificar: una cápsula por lavado.",
  },
  {
    icon: Package,
    title: "Presentación práctica",
    text: "Envase de 40 cápsulas con manija y tapa a rosca.",
  },
  {
    icon: Palette,
    title: "Protección de colores",
    text: "Cuida los tejidos y los colores, lavado tras lavado.",
  },
  {
    icon: Wind,
    title: "Frescura Ocean Mist",
    text: "Aroma que queda en la ropa colgada y en el placard.",
  },
  {
    icon: Archive,
    title: "Fácil de guardar",
    text: "Ocupa poco: arriba del lavarropas o en un estante.",
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-mar">
            Beneficios
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-deep sm:text-5xl">
            ¿Por qué elegir <span className="text-brand">Powerful</span>?
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={(i % 3) * 0.08}>
              <div className="group h-full rounded-[1.8rem] border border-deep/5 bg-gradient-to-b from-white to-ice/40 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand/8 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <b.icon className="size-6" strokeWidth={2} />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-deep">{b.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-deep/65">
                  {b.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
