import { ConmutadorArea } from "@/components/nav";
import { requerirAdmin } from "@/lib/auth";
import { salir } from "../login/actions";

/** Cáscara común de las dos interfaces del administrador. */
export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  await requerirAdmin();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-borde bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-2.5">
          <p className="text-sm font-semibold tracking-tight text-marea-700">Aqua Mar</p>
          <ConmutadorArea />
          <form action={salir}>
            <button className="text-xs font-medium text-suave hover:text-marea-700">Salir</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
