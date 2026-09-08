import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { businessConfig } from "@/config/business";
import { content } from "@/data/content";
import { footerNav, legalNav } from "@/data/navigation";
import { WA_MESSAGES } from "@/lib/whatsapp";
import { WhatsAppIcon, InstagramIcon } from "@/components/ui/icons";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";

/** Footer de cuatro columnas sobre azul marino. */
export function Footer() {
  return (
    <footer id="contacto" className="bg-navy text-white/70">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-[60px]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/branding/aqua-mar-logo.jpg"
              alt="Logo Aqua Mar"
              width={52}
              height={52}
              className="size-12 rounded-full object-cover"
            />
            <div>
              <p className="font-display text-lg font-extrabold text-white">AQUA MAR</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-turquesa">
                {businessConfig.descriptor}
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed">{content.footer.description}</p>
          <p className="mt-3 text-sm font-semibold text-white/85">
            {businessConfig.coverage.local} · {businessConfig.coverage.national}
          </p>
        </div>

        <div>
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
            Navegación
          </p>
          <ul className="grid gap-2.5 text-sm">
            {footerNav.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-turquesa">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wider text-white">
            Productos
          </p>
          <ul className="grid gap-2.5 text-sm">
            {businessConfig.productPresentations.map((p) => (
              <li key={p}>Powerful 3 en 1 · {p}</li>
            ))}
          </ul>
          <p className="mb-4 mt-8 text-sm font-extrabold uppercase tracking-wider text-white">
            Legales
          </p>
          <ul className="grid gap-2.5 text-sm">
            {legalNav.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-turquesa">
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
              <WhatsAppIcon className="mt-0.5 size-4 flex-none text-turquesa" />
              {businessConfig.whatsappDisplay}
            </li>
            <li className="flex items-start gap-2.5">
              <InstagramIcon className="mt-0.5 size-4 flex-none text-turquesa" />
              <a
                href={businessConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener"
                className="transition-colors hover:text-turquesa"
              >
                @{businessConfig.instagram}
              </a>
            </li>
            {businessConfig.email && (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 flex-none text-turquesa" />
                <a
                  href={`mailto:${businessConfig.email}`}
                  className="break-all transition-colors hover:text-turquesa"
                >
                  {businessConfig.email}
                </a>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 flex-none text-turquesa" />
              {businessConfig.address}
            </li>
          </ul>
          <div className="mt-6">
            <WhatsAppLink
              message={WA_MESSAGES.general}
              location="footer"
              variant="turquesa"
              className="!min-h-[48px] !px-6 !text-sm"
            >
              Escribinos
            </WhatsAppLink>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1320px] px-5 py-6 text-center text-xs leading-relaxed text-white/45 sm:px-6 lg:px-[60px]">
          <p>{content.footer.legal}</p>
          <p className="mt-2">
            © {new Date().getFullYear()} {businessConfig.name} Distribuidora. Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
