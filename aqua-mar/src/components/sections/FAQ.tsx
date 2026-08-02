"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/data/faq";
import { trackEvent } from "@/analytics/track-event";
import { Container, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";

/** FAQ accesible: acordeón con una sola respuesta abierta. */
export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null);

  function toggle(id: string) {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (next) {
      trackEvent({ name: "faq_open", category: "engagement", params: { question_id: id } });
    }
  }

  return (
    <section className="bg-gradient-to-b from-white to-celeste/40 py-16 sm:py-24" aria-label="Preguntas frecuentes">
      <Container className="max-w-3xl">
        <Reveal>
          <SectionTitle kicker="Preguntas frecuentes" title="Lo que necesitás saber" />
        </Reveal>

        <div className="mt-12 grid gap-3">
          {faqItems.map((f, i) => {
            const open = openId === f.id;
            return (
              <Reveal key={f.id} delay={i * 0.05}>
                <div
                  className={`overflow-hidden rounded-3xl border transition-colors ${
                    open ? "border-turquesa/40 bg-white shadow-xs" : "border-border bg-white/70"
                  }`}
                >
                  <button
                    onClick={() => toggle(f.id)}
                    aria-expanded={open}
                    aria-controls={`faq-${f.id}`}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <span className="font-display text-[17px] font-extrabold text-ink">
                      {f.question}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={`size-5 flex-none text-primary transition-transform duration-[250ms] ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    id={`faq-${f.id}`}
                    role="region"
                    className={`grid transition-all duration-[250ms] ease-out ${
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-[15px] leading-relaxed text-ink-soft">
                        {f.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
