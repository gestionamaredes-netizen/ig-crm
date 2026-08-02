import Image from "next/image";
import { product } from "@/config";
import { waLink } from "@/lib/wa";
import { Reveal } from "./reveal";
import { WhatsAppIcon } from "./whatsapp-icon";

export function Presentations() {
  return (
    <section className="bg-white pb-24 lg:pb-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-mar">
            Presentaciones
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-deep sm:text-5xl">
            Elegí tu tamaño
          </h2>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
          {product.presentaciones.map((p, i) => (
            <Reveal key={p.capsulas} delay={i * 0.1}>
              <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-deep/5 bg-gradient-to-b from-ice/50 to-white shadow-soft transition-transform duration-300 hover:-translate-y-1.5">
                <div className="relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={p.img}
                    alt={`${product.name}, ${p.etiqueta.toLowerCase()}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ objectPosition: p.imgPos }}
                  />
                  <span className="glass absolute left-4 top-4 rounded-full px-4 py-1.5 font-display text-sm font-extrabold text-deep">
                    {p.capsulas} cápsulas
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-xl font-extrabold text-deep">
                    {p.etiqueta}
                  </h3>
                  <p className="mt-1.5 flex-1 text-[15px] text-deep/65">{p.detalle}</p>
                  <a
                    href={waLink(
                      `Hola Aqua Mar! Quiero pedir Powerful PODS 3 en 1, ${p.etiqueta.toLowerCase()}. ¿Me pasás precio y envío?`
                    )}
                    target="_blank"
                    rel="noopener"
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-deep"
                  >
                    <WhatsAppIcon className="size-4" />
                    Pedir este
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-8 text-center text-sm text-deep/55">
            ¿No sabés cuál te conviene? Escribinos y te asesoramos según cuánto
            lavás por semana.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
