import { Nav } from "@/components/nav";
import { requerirAdmin } from "@/lib/auth";
import { SOLO_PROSPECCION } from "@/lib/sitio";

const ITEMS = [
  { href: "/comercial", texto: "Dashboard" },
  { href: "/comercial/clientes", texto: "Clientes" },
  { href: "/comercial/prospeccion", texto: "Prospección" },
  { href: "/comercial/pedidos", texto: "Pedidos" },
  { href: "/comercial/precios", texto: "Precios" },
  { href: "/comercial/compras", texto: "Compras" },
  { href: "/comercial/proveedores", texto: "Proveedores" },
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
      {/* Una sola sección no necesita barra de solapas: el título de la página
          ya dice dónde estás, y una solapa única es ruido. */}
      {!SOLO_PROSPECCION && (
        <div className="border-b border-borde bg-white">
          <div className="mx-auto w-full max-w-5xl px-4 py-2 sm:px-5">
            <Nav items={ITEMS} raiz="/comercial" />
          </div>
        </div>
      )}
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-5">{children}</main>
    </>
  );
}
