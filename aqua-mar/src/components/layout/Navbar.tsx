"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { businessConfig } from "@/config/business";
import { mainNav } from "@/data/navigation";
import { WA_MESSAGES } from "@/lib/whatsapp";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";

/** Navbar fija de 88px con glass, menú centro y doble CTA. */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        open ? "bg-white shadow-sm" : scrolled ? "glass shadow-xs" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Principal"
        className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-6 lg:h-[88px] lg:px-[60px]"
      >
        <a href="#inicio" className="flex items-center gap-2.5" aria-label="Aqua Mar, inicio">
          <Image
            src="/branding/aqua-mar-logo.jpg"
            alt=""
            width={48}
            height={48}
            className="size-10 rounded-full object-cover lg:size-12"
            priority
          />
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-extrabold tracking-tight text-navy">
              AQUA MAR
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              {businessConfig.descriptor}
            </span>
          </span>
        </a>

        <ul className="hidden items-center gap-7 xl:flex">
          {mainNav.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-semibold text-ink/80 transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <a
            href="#powerful"
            className="hidden min-h-[48px] items-center rounded-[18px] border-2 border-primary/25 bg-white/70 px-5 text-sm font-bold text-primary backdrop-blur transition-all hover:border-primary lg:inline-flex"
          >
            Ver producto
          </a>
          <WhatsAppLink
            message={WA_MESSAGES.wholesale}
            location="navbar"
            intent="wholesale"
            className="!hidden !min-h-[48px] !px-5 !text-sm sm:!inline-flex"
          >
            Consultar por mayor
          </WhatsAppLink>
          <button
            className="inline-flex size-11 items-center justify-center rounded-full text-ink xl:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="menu-mobile"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      {open && <MobileMenu onNavigate={() => setOpen(false)} />}
    </header>
  );
}

/** Menú desplegable mobile con fondo sólido. */
function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div id="menu-mobile" className="border-t border-border bg-white px-5 pb-6 pt-2 xl:hidden">
      <ul className="grid gap-1">
        {mainNav.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              onClick={onNavigate}
              className="block rounded-2xl px-3 py-3 text-[15px] font-semibold text-ink hover:bg-mist"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <WhatsAppLink
        message={WA_MESSAGES.wholesale}
        location="mobile_menu"
        intent="wholesale"
        className="mt-3 w-full"
      >
        Consultar por mayor
      </WhatsAppLink>
    </div>
  );
}
