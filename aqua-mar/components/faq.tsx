"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import faqs from "@/data/faq.json";
import { Reveal } from "./reveal";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-gradient-to-b from-white to-ice/50 py-24">
      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        <Reveal className="text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-mar">
            Preguntas frecuentes
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-deep sm:text-5xl">
            Lo que siempre nos preguntan
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-3">
          {faqs.map((f, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={f.pregunta} delay={i * 0.05}>
                <div
                  className={`overflow-hidden rounded-3xl border transition-colors ${
                    open
                      ? "border-mar/40 bg-white shadow-soft"
                      : "border-deep/8 bg-white/70"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display text-[17px] font-extrabold text-deep">
                      {f.pregunta}
                    </span>
                    <ChevronDown
                      className={`size-5 flex-none text-brand transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-[15px] leading-relaxed text-deep/70">
                        {f.respuesta}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
