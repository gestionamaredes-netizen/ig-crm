import { Nav } from "@/components/nav";

const ITEMS = [
  { href: "/comercial", texto: "Dashboard" },
  { href: "/comercial/clientes", texto: "Clientes" },
  { href: "/comercial/pedidos", texto: "Pedidos" },
  { href: "/comercial/gastos", texto: "Gastos" },
  { href: "/comercial/reportes", texto: "Reportes" },
];

export default function LayoutComercial({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="border-b border-borde bg-white">
        <div className="mx-auto w-full max-w-5xl px-5 py-2">
          <Nav items={ITEMS} raiz="/comercial" />
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl px-5 py-6">{children}</main>
    </>
  );
}
