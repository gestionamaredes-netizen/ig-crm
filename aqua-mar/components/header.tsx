"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { waLink, WA_MESSAGES } from "@/lib/wa";
import { WhatsAppIcon } from "./whatsapp-icon";

const LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#powerful", label: "Powerful" },
  { href: "#beneficios", label: "Beneficios" },
  { href: "#mayoristas", label: "Mayoristas" },
  { href: "#cobertura", label: "Cobertura" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
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
        open
          ? "bg-white shadow-soft"
          : scrolled
            ? "glass shadow-soft"
            : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:h-[72px] lg:px-6">
        <a href="#inicio" className="flex items-center gap-2.5" aria-label="Aqua Mar, inicio">
          <Image
            src="/img/logo-aqua-mar.jpg"
            alt="Logo Aqua Mar"
            width={44}
            height={44}
            className="size-10 rounded-full object-cover lg:size-11"
            priority
          />
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-extrabold tracking-tight text-deep">
              AQUA MAR
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
              Distribuidora Oficial Powerful
            </span>
          </span>
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-semibold text-deep/80 transition-colors hover:text-brand"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={waLink(WA_MESSAGES.pedido)}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-deep sm:inline-flex"
          >
            <WhatsAppIcon className="size-4" />
            Pedir por WhatsApp
          </a>
          <button
            className="inline-flex size-10 items-center justify-center rounded-full text-deep lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-deep/5 px-4 pb-5 pt-2 lg:hidden">
          <ul className="grid gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-[15px] font-semibold text-deep hover:bg-ice"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={waLink(WA_MESSAGES.pedido)}
            target="_blank"
            rel="noopener"
            className="mt-3 flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white"
          >
            <WhatsAppIcon className="size-4" />
            Pedir por WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
