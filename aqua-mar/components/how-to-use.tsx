import { Reveal } from "./reveal";

const STEPS = [
  {
    n: "1",
    title: "Colocá la cápsula",
    text: "Directo en el fondo del tambor, antes que la ropa.",
  },
  {
    n: "2",
    title: "Agregá la ropa",
    text: "Cargá el lavarropas como siempre.",
  },
  {
    n: "3",
    title: "Iniciá el lavado",
    text: "La cápsula se disuelve sola, en frío o en caliente.",
  },
];

export function HowToUse() {
  return (
    <section className="bg-gradient-to-b from-white to-ice/60 py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-mar">
            Cómo se usa
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-deep sm:text-5xl">
            Tres pasos. Cero complicación.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-[1.8rem] border border-deep/5 bg-white p-8 shadow-soft transition-transform duration-300 hover:-translate-y-1.5">
                <span
                  aria-hidden
                  className="absolute -right-3 -top-6 font-display text-[104px] font-extrabold leading-none text-ice transition-colors group-hover:text-mar/15"
                >
                  {s.n}
                </span>
                <span className="relative inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-mar font-display text-xl font-extrabold text-white">
                  {s.n}
                </span>
                <h3 className="relative mt-5 text-xl font-extrabold text-deep">
                  {s.title}
                </h3>
                <p className="relative mt-2 text-[15px] text-deep/65">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.25}>
          <p className="mt-8 text-center text-xs text-deep/50">
            Seguí siempre las instrucciones de uso y seguridad impresas en el
            envase. Mantener fuera del alcance de niños y animales domésticos.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
