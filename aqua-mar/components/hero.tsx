"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Layers, Hand, Package } from "lucide-react";
import { waLink, WA_MESSAGES } from "@/lib/wa";
import { WhatsAppIcon } from "./whatsapp-icon";
import { Bubbles } from "./bubbles";

const FEATURES = [
  { icon: Layers, title: "3 en 1", text: "Lava, desmancha y perfuma" },
  { icon: Hand, title: "Fácil de usar", text: "Una cápsula, y listo" },
  { icon: Package, title: "20 y 40", text: "Dos presentaciones" },
];

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-svh items-center overflow-hidden bg-gradient-to-b from-ice via-white to-white pt-24 lg:pt-20"
    >
      {/* Luz y agua de fondo */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -top-40 right-[-15%] size-[560px] rounded-full bg-mar/15 blur-3xl" />
        <div className="absolute top-1/3 left-[-10%] size-[420px] rounded-full bg-brand/10 blur-3xl" />
      </div>
      <Bubbles />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 lg:grid-cols-2 lg:gap-8 lg:px-6">
        {/* Columna de texto */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/70 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand backdrop-blur"
          >
            <span className="size-1.5 rounded-full bg-mar" />
            Distribuidora oficial Powerful · Zona Oeste
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="font-display text-[44px] font-extrabold leading-[1.02] tracking-tight text-deep sm:text-6xl lg:text-7xl"
          >
            Limpieza profunda{" "}
            <span className="bg-gradient-to-r from-brand to-mar bg-clip-text text-transparent">
              que se nota.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-5 max-w-md text-lg text-deep/70"
          >
            Cápsulas 3 en 1 para un lavado práctico, rápido y eficiente.
            Minorista, mayorista y envíos a toda la Argentina.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href={waLink(WA_MESSAGES.pedido)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-[15px] font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-deep hover:shadow-glow"
            >
              <WhatsAppIcon className="size-5" />
              Pedir por WhatsApp
            </a>
            <a
              href="#powerful"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand/20 bg-white/70 px-7 py-3.5 text-[15px] font-bold text-brand backdrop-blur transition-all hover:-translate-y-0.5 hover:border-brand"
            >
              Ver productos
            </a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.34 }}
            className="mt-10 grid max-w-md grid-cols-3 gap-3"
          >
            {FEATURES.map((f) => (
              <li key={f.title} className="flex flex-col gap-1.5">
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-brand/8 text-brand">
                  <f.icon className="size-5" strokeWidth={2.2} />
                </span>
                <span className="text-sm font-extrabold text-deep">{f.title}</span>
                <span className="text-xs leading-snug text-deep/60">{f.text}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Columna del producto */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 size-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-mar/25 via-ice to-transparent blur-2xl" />
          </div>

          <div className="animate-float-slow">
            <div className="relative aspect-[4/5] max-h-[600px] w-full overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgb(0_43_115/0.35)]">
              <Image
                src="/img/powerful-40-capsulas.jpg"
                alt="Envase de Powerful PODS 3 en 1 con 40 cápsulas, fragancia Ocean Mist"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover object-[50%_40%]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-deep/10 via-transparent to-white/10" />
            </div>
          </div>

          {/* Tarjeta glass flotante con la cápsula */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="glass absolute -bottom-6 -left-3 flex items-center gap-3 rounded-3xl p-3 pr-5 shadow-soft sm:-left-8"
          >
            <Image
              src="/img/powerful-capsulas.jpg"
              alt="Cápsulas Powerful 3 en 1"
              width={72}
              height={72}
              className="size-16 rounded-2xl object-cover"
            />
            <div>
              <p className="text-sm font-extrabold text-deep">Ocean Mist</p>
              <p className="text-xs font-medium text-deep/60">Fragancia que dura</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
