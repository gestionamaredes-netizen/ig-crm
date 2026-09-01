import { Nav } from "@/components/nav";
import { requerirAdmin } from "@/lib/auth";
import { salir } from "../login/actions";

const ITEMS = [
  { href: "/admin", texto: "Tablero" },
  { href: "/admin/inventario", texto: "Inventario" },
  { href: "/admin/clientes", texto: "Clientes" },
  { href: "/admin/pedidos", texto: "Pedidos" },
  { href: "/admin/gastos", texto: "Gastos" },
  { href: "/admin/reportes", texto: "Reportes" },
];

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  await requerirAdmin();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-borde bg-white/90 backdrop-blur">
        <div className="mx-auto w-full max-w-5xl px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold tracking-tight text-marea-700">Aqua Mar</p>
              <p className="text-xs text-suave">Panel de administración</p>
            </div>
            <form action={salir}>
              <button className="text-xs font-medium text-suave hover:text-marea-700">Salir</button>
            </form>
          </div>
          <div className="mt-3">
            <Nav items={ITEMS} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-5 py-6">{children}</main>
    </div>
  );
}
