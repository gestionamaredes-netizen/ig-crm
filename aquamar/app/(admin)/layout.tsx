import Image from "next/image";
import { ConmutadorArea } from "@/components/nav";
import { requerirAdmin } from "@/lib/auth";
import { salir } from "../login/actions";

/** Cáscara común de las dos interfaces del administrador. */
export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  await requerirAdmin();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-borde bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-2 sm:gap-3 sm:px-5">
          {/* En pantallas muy angostas no entra junto al conmutador: el conmutador
              ya dice en qué área estás. */}
          <Image
            src="/marca/logotipo.png"
            alt="Aqua Mar"
            width={646}
            height={131}
            priority
            className="hidden h-6 w-auto shrink-0 min-[380px]:block"
          />
          <ConmutadorArea />
          <form action={salir}>
            <button className="toque shrink-0 rounded-lg px-2 text-xs font-medium text-suave hover:bg-azul-50 hover:text-azul-700">
                Salir
              </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
