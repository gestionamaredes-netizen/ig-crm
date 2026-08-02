"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { content } from "@/data/content";
import { WA_MESSAGES } from "@/lib/whatsapp";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/motion";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { SecondaryButton } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/primitives";
import { Bubbles } from "@/components/ui/Bubbles";

/** Hero 100vh: texto 45% / producto real 55%. */
export function Hero() {
  const hero = content.hero;
  return (
    <section
      id="inicio"
      className="relative flex min-h-svh items-center overflow-hidden bg-gradient-to-b from-celeste/60 via-bg to-bg pt-24 lg:pt-[88px]"
    >
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -top-40 right-[-15%] size-[560px] rounded-full bg-turquesa/15 blur-3xl" />
        <div className="absolute left-[-10%] top-1/3 size-[420px] rounded-full bg-primary/10 blur-3xl" />
      </div>
      <Bubbles />

      <div className="relative mx-auto grid w-full max-w-[1320px] items-center gap-12 px-5 pb-16 sm:px-6 lg:grid-cols-[45fr_55fr] lg:gap-10 lg:px-[60px]">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={fadeUp}>
            <Badge>
              <span className="size-1.5 rounded-full bg-turquesa" />
              {hero.badge}
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-5 font-display text-[42px] font-extrabold leading-[1.04] tracking-tight text-navy sm:text-6xl xl:text-7xl"
          >
            Powerful por mayor,{" "}
            <span className="bg-gradient-to-r from-primary to-turquesa bg-clip-text text-transparent">
              directo de la distribuidora oficial.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 max-w-lg text-lg text-ink-soft">
            {hero.subtitle}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <WhatsAppLink
              message={WA_MESSAGES.wholesale}
              location="hero"
              intent="wholesale"
              className="max-sm:w-full"
            >
              {hero.ctaPrimary}
            </WhatsAppLink>
            <SecondaryButton href="#powerful" className="max-sm:w-full">
              {hero.ctaSecondary}
            </SecondaryButton>
          </motion.div>

          <motion.ul variants={fadeUp} className="mt-9 grid gap-2.5">
            {hero.indicators.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[15px] font-semibold text-ink/85">
                <span className="inline-flex size-6 flex-none items-center justify-center rounded-full bg-turquesa/15 text-turquesa">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 size-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-turquesa/25 via-celeste to-transparent blur-2xl" />
          </div>

          <div className="animate-float">
            <div className="relative aspect-[4/5] max-h-[600px] w-full overflow-hidden rounded-[36px] bg-gradient-to-br from-celeste/80 via-white to-bg shadow-xl">
              <Image
                src="/products/powerful-40-envase.png"
                alt="Envase original de Powerful PODS 3 en 1, presentación de 40 cápsulas"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-contain p-8 drop-shadow-xl sm:p-12"
              />
              <span className="glass absolute right-5 top-5 rounded-full px-4 py-1.5 font-display text-sm font-extrabold text-navy shadow-sm">
                Bulto cerrado × 12
              </span>
            </div>
          </div>

          <div className="glass absolute -bottom-6 -left-3 flex items-center gap-3 rounded-3xl p-3 pr-5 shadow-md sm:-left-8">
            <Image
              src="/products/powerful-capsula-detalle.webp"
              alt="Cápsula Powerful 3 en 1"
              width={72}
              height={72}
              className="size-16 rounded-2xl object-cover"
            />
            <div>
              <p className="text-sm font-extrabold text-navy">Ocean Mist</p>
              <p className="text-xs font-medium text-ink-soft">Fragancia original</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
