import { Nav } from "@/components/nav";

const ITEMS = [
  { href: "/deposito", texto: "Stock" },
  { href: "/deposito/productos", texto: "Productos" },
  { href: "/deposito/movimientos", texto: "Movimientos" },
];

export default function LayoutDeposito({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="border-b border-borde bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-2 sm:px-5">
          <Nav items={ITEMS} raiz="/deposito" />
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-5">{children}</main>
    </>
  );
}
