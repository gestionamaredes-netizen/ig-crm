import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { InstagramIcon } from "./instagram-icon";
import { business } from "@/config";
import { waLink, WA_MESSAGES } from "@/lib/wa";
import { WhatsAppIcon } from "./whatsapp-icon";

const NAV = [
  { href: "#inicio", label: "Inicio" },
  { href: "#powerful", label: "Powerful" },
  { href: "#beneficios", label: "Beneficios" },
  { href: "#mayoristas", label: "Mayoristas" },
  { href: "#cobertura", label: "Cobertura" },
];

export function Footer() {
  return (
    <footer id="contacto" className="bg-[#001A47] text-white/70">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3">
            <Image
              src="/img/logo-aqua-mar.jpg"
              alt="Logo Aqua Mar"
              width={52}
              height={52}
              className="size-13 rounded-full object-cover"
            />
            <div>
              <p className="font-display text-xl font-extrabold text-white">
                AQUA MAR
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mar">
                {business.slogan}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            {business.coverage[0]} · {business.coverage[1]}. Venta minorista y
            mayorista de Powerful PODS 3 en 1.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={waLink(WA_MESSAGES.consulta)}
              target="_blank"
              rel="noopener"
              aria-label="WhatsApp"
              className="inline-flex size-11 items-center justify-center rounded-full bg-white/8 text-white transition-colors hover:bg-mar hover:text-deep"
            >
              <WhatsAppIcon className="size-5" />
            </a>
            <a
              href={business.socialLinks.instagram}
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="inline-flex size-11 items-center justify-center rounded-full bg-white/8 text-white transition-colors hover:bg-mar hover:text-deep"
            >
              <InstagramIcon className="size-5" />
            </a>
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                aria-label="Correo"
                className="inline-flex size-11 items-center justify-center rounded-full bg-white/8 text-white transition-colors hover:bg-mar hover:text-deep"
              >
                <Mail className="size-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
            Navegación
          </p>
          <ul className="grid gap-2.5 text-sm">
            {NAV.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-mar">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
            Contacto
          </p>
          <ul className="grid gap-3 text-sm">
            <li className="flex items-start gap-2.5">
              <WhatsAppIcon className="mt-0.5 size-4 flex-none text-mar" />
              <a
                href={waLink(WA_MESSAGES.consulta)}
                target="_blank"
                rel="noopener"
                className="transition-colors hover:text-mar"
              >
                {business.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <InstagramIcon className="mt-0.5 size-4 flex-none text-mar" />
              <a
                href={business.socialLinks.instagram}
                target="_blank"
                rel="noopener"
                className="transition-colors hover:text-mar"
              >
                @{business.instagram}
              </a>
            </li>
            {business.email && (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 flex-none text-mar" />
                <a
                  href={`mailto:${business.email}`}
                  className="break-all transition-colors hover:text-mar"
                >
                  {business.email}
                </a>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 flex-none text-mar" />
              {business.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs leading-relaxed text-white/45 lg:px-6">
          <p>
            Aqua Mar actúa como distribuidora oficial de Powerful para su zona
            de cobertura. La marca Powerful pertenece a sus respectivos
            titulares.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} {business.company} Distribuidora.
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
