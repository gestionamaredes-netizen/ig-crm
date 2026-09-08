"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, viewportOnce } from "@/lib/motion";
import type { Variants } from "framer-motion";

/** Aparición al entrar en viewport, con variantes del sistema. */
export function Reveal({
  children,
  variants = fadeUp,
  delay = 0,
  className,
}: {
  children: ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
