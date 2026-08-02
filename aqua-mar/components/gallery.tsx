import Image from "next/image";
import { Reveal } from "./reveal";

const PHOTOS = [
  {
    src: "/img/powerful-40-capsulas.jpg",
    alt: "Balde de Powerful PODS 3 en 1 de 40 cápsulas",
    caption: "Balde de 40 cápsulas",
    pos: "50% 45%",
  },
  {
    src: "/img/powerful-20-capsulas.jpg",
    alt: "Balde de Powerful PODS 3 en 1 de 20 cápsulas",
    caption: "Balde de 20 cápsulas",
    pos: "50% 60%",
  },
  {
    src: "/img/powerful-capsulas.jpg",
    alt: "Cápsulas Powerful 3 en 1 en detalle",
    caption: "Las cápsulas",
    pos: "50% 32%",
  },
  {
    src: "/img/powerful-caja-mayorista.jpg",
    alt: "Caja mayorista con 8 baldes de Powerful",
    caption: "Stock real, caja de 8",
    pos: "50% 50%",
  },
];

export function Gallery() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-mar">
            Galería
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-deep sm:text-5xl">
            Producto real, fotos reales
          </h2>
          <p className="mt-4 text-deep/65">
            Lo que ves es lo que llega: mismo envase, mismas cápsulas, mismo
            stock que despachamos todos los días.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PHOTOS.map((p, i) => (
            <Reveal key={p.src} delay={i * 0.08}>
              <figure className="group relative aspect-[4/5] overflow-hidden rounded-[1.8rem] shadow-soft">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ objectPosition: p.pos }}
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep/70 to-transparent p-5 pt-14">
                  <span className="text-sm font-extrabold text-white">
                    {p.caption}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
