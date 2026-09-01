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
          {/* En pantallas muy angostas la marca se cortaba en "Aqu...": el conmutador
              ya dice en qué área estás. */}
          <p className="hidden shrink-0 whitespace-nowrap text-sm font-semibold tracking-tight text-marea-700 min-[380px]:block">
            Aqua Mar
          </p>
          <ConmutadorArea />
          <form action={salir}>
            <button className="toque shrink-0 rounded-lg px-2 text-xs font-medium text-suave hover:bg-marea-50 hover:text-marea-700">
                Salir
              </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
