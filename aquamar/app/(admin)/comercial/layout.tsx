import { Nav } from "@/components/nav";
import { requerirAdmin } from "@/lib/auth";

const ITEMS = [
  { href: "/comercial", texto: "Dashboard" },
  { href: "/comercial/clientes", texto: "Clientes" },
  { href: "/comercial/pedidos", texto: "Pedidos" },
  { href: "/comercial/precios", texto: "Precios" },
  { href: "/comercial/compras", texto: "Compras" },
  { href: "/comercial/proveedores", texto: "Proveedores" },
  { href: "/comercial/vendedores", texto: "Vendedores" },
  { href: "/comercial/caja", texto: "Caja" },
  { href: "/comercial/gastos", texto: "Gastos" },
  { href: "/comercial/reportes", texto: "Reportes" },
  { href: "/comercial/preguntas", texto: "Preguntas" },
  { href: "/comercial/datos", texto: "Datos" },
];

export default async function LayoutComercial({ children }: { children: React.ReactNode }) {
  // La parte comercial tiene costos, márgenes y caja: solo administración.
  await requerirAdmin();

  return (
    <>
      <div className="border-b border-borde bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-2 sm:px-5">
          <Nav items={ITEMS} raiz="/comercial" />
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-5">{children}</main>
    </>
  );
}
