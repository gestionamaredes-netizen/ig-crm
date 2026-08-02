import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "./Footer";

/** Layout compartido de las páginas legales. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <main className="min-h-svh bg-bg">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Volver al inicio">
            <Image
              src="/branding/aqua-mar-logo.jpg"
              alt=""
              width={44}
              height={44}
              className="size-11 rounded-full object-cover"
            />
            <span className="font-display text-lg font-extrabold text-navy">AQUA MAR</span>
          </Link>
          <h1 className="mt-10 font-display text-4xl font-extrabold tracking-tight text-navy">
            {title}
          </h1>
          <div className="mt-8 grid gap-5 text-[16px] leading-relaxed text-ink-soft">
            {children}
          </div>
          <Link
            href="/"
            className="mt-10 inline-flex min-h-[48px] items-center rounded-[18px] border-2 border-primary/25 bg-white px-6 text-sm font-bold text-primary transition-all hover:border-primary"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
