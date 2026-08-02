import Image from "next/image";
import Link from "next/link";
import { WA_MESSAGES } from "@/lib/whatsapp";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-celeste/60 to-bg px-6 text-center">
      <Image
        src="/branding/aqua-mar-logo.jpg"
        alt="Logo Aqua Mar"
        width={96}
        height={96}
        className="size-24 rounded-full object-cover shadow-md"
      />
      <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
        No encontramos esta página.
      </h1>
      <p className="mt-4 max-w-md text-lg text-ink-soft">
        Podés volver al inicio o comunicarte con Aqua Mar.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[52px] items-center justify-center rounded-[18px] bg-primary px-8 text-[15px] font-bold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-primary-hover"
        >
          Volver al inicio
        </Link>
        <WhatsAppLink message={WA_MESSAGES.general} location="not_found" variant="secondary">
          Consultar por WhatsApp
        </WhatsAppLink>
      </div>
    </main>
  );
}
