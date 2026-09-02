import Image from "next/image";
import { Nav } from "@/components/nav";
import { requerirCliente } from "@/lib/auth";
import { salir } from "../login/actions";

const ITEMS = [
  { href: "/panel", texto: "Mi stock" },
  { href: "/panel/pedir", texto: "Hacer pedido" },
  { href: "/panel/entregas", texto: "Entregas" },
  { href: "/panel/ventas", texto: "Mis ventas" },
];

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const sesion = await requerirCliente();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-borde bg-white/90 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Image src="/marca/logotipo.png" alt="Aqua Mar" width={646} height={131} priority className="h-6 w-auto" />
            <span className="text-xs text-suave">Distribuidora</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-tinta">{sesion.comercio}</p>
              <p className="truncate text-xs text-suave">
                {sesion.rol === "representante" ? `Representante: ${sesion.nombre}` : sesion.nombre}
              </p>
            </div>
            <form action={salir}>
              <button className="toque shrink-0 rounded-lg px-2 text-xs font-medium text-suave hover:bg-azul-50 hover:text-azul-700">
                Salir
              </button>
            </form>
          </div>
          <div className="mt-3">
            <Nav items={ITEMS} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-5">{children}</main>
    </div>
  );
}
