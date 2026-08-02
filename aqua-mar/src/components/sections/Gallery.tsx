"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { content } from "@/data/content";
import { trackEvent } from "@/analytics/track-event";
import { Container, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";

/** Galería con fotos originales, zoom suave y lightbox accesible. */
export function Gallery() {
  const g = content.gallery;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setOpenIndex(i);
    trackEvent({ name: "gallery_open", category: "engagement", params: { index: i } });
  };

  return (
    <section className="bg-white py-16 sm:py-24 lg:py-32" aria-label="Galería de producto">
      <Container>
        <Reveal>
          <SectionTitle kicker={g.kicker} title={g.title} text={g.text} />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {g.items.map((item, i) => (
            <Reveal key={item.src} delay={i * 0.08}>
              <button
                onClick={() => open(i)}
                aria-label={`Ampliar imagen: ${item.caption}`}
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-xs transition-shadow hover:shadow-md"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ objectPosition: item.pos }}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/70 to-transparent p-5 pt-14 text-left">
                  <span className="text-sm font-extrabold text-white">{item.caption}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </Container>

      {openIndex !== null && (
        <GalleryLightbox
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </section>
  );
}

/** Lightbox: cierre con Escape, navegación con flechas, foco contenido. */
function GalleryLightbox({
  index,
  onClose,
  onNavigate,
}: {
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const items = content.gallery.items;
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index];

  const prev = useCallback(
    () => onNavigate((index - 1 + items.length) % items.length),
    [index, items.length, onNavigate]
  );
  const next = useCallback(
    () => onNavigate((index + 1) % items.length),
    [index, items.length, onNavigate]
  );

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85svh] w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/5] max-h-[80svh] w-full overflow-hidden rounded-[28px]">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="90vw"
            className="object-contain"
          />
        </div>
        <p className="mt-3 text-center text-sm font-bold text-white">{item.caption}</p>

        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Cerrar galería"
          className="absolute -top-2 right-0 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        >
          <X className="size-5" />
        </button>
        <button
          onClick={prev}
          aria-label="Imagen anterior"
          className="absolute left-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          onClick={next}
          aria-label="Imagen siguiente"
          className="absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>
    </div>
  );
}
