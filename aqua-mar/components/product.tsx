import Image from "next/image";
import { Check } from "lucide-react";
import { waLink, WA_MESSAGES } from "@/lib/wa";
import { Reveal } from "./reveal";
import { WhatsAppIcon } from "./whatsapp-icon";

const BENEFITS = [
  "Limpieza profunda",
  "Aroma duradero",
  "Fácil utilización",
  "Dosis lista, sin medir",
  "Presentación de 40 cápsulas",
];

const TAGS = [
  { label: "Detergente", pos: "left-3 top-5 sm:left-6 sm:top-8" },
  { label: "Quitamanchas", pos: "right-3 top-[30%] sm:right-6" },
  { label: "Suavizante", pos: "bottom-[14%] left-[16%]" },
];

export function Product() {
  return (
    <section id="powerful" className="relative overflow-hidden bg-white py-24 lg:py-32">
      <div
        aria-hidden
        className="absolute left-[-10%] top-24 size-[380px] rounded-full bg-ice blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 lg:grid-cols-2 lg:gap-20 lg:px-6">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] shadow-soft">
            <Image
              src="/img/powerful-capsulas.jpg"
              alt="Cápsulas Powerful 3 en 1: detergente, quitamanchas y suavizante"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover object-[50%_32%]"
            />
            {TAGS.map((t) => (
              <span
                key={t.label}
                className={`glass absolute ${t.pos} rounded-full px-3.5 py-1.5 text-xs font-extrabold text-deep shadow-soft`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-mar">
              Powerful 3 en 1
            </p>
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-deep sm:text-5xl lg:text-6xl">
              Una cápsula.
              <br />
              <span className="text-brand">Y listo.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg text-deep/70">
              Cada cápsula combina detergente, quitamanchas y suavizante en la
              dosis justa. La ponés en el tambor con la ropa y el lavarropas
              hace el resto.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-8 grid gap-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="inline-flex size-6 flex-none items-center justify-center rounded-full bg-mar/15 text-mar">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="font-semibold text-deep/85">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.18}>
            <a
              href={waLink(WA_MESSAGES.pedido)}
              target="_blank"
              rel="noopener"
              className="mt-9 inline-flex items-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-[15px] font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-deep"
            >
              <WhatsAppIcon className="size-5" />
              Consultar precio
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
