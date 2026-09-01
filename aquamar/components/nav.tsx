"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ItemNav = { href: string; texto: string };

/** Pestañas de la sección actual. */
export function Nav({ items, raiz }: { items: ItemNav[]; raiz?: string }) {
  const ruta = usePathname();

  return (
    <nav className="-mx-5 overflow-x-auto px-5">
      <ul className="flex min-w-max gap-1 pb-1">
        {items.map((item) => {
          // La raíz del área solo se marca en coincidencia exacta; el resto por prefijo.
          const activo = ruta === item.href || (item.href !== raiz && ruta.startsWith(`${item.href}/`));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`inline-flex rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                  activo ? "bg-marea-600 text-white" : "text-suave hover:bg-marea-50 hover:text-marea-700"
                }`}
              >
                {item.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Salto entre las dos interfaces del administrador. Va siempre a la vista
 * porque el depósito y lo comercial se usan en momentos distintos del día.
 */
export function ConmutadorArea() {
  const ruta = usePathname();
  const areas = [
    { href: "/comercial", texto: "Comercial" },
    { href: "/deposito", texto: "Depósito" },
  ];

  return (
    <div className="flex rounded-xl border border-borde bg-fondo p-0.5">
      {areas.map((a) => {
        const activo = ruta === a.href || ruta.startsWith(`${a.href}/`);
        return (
          <Link
            key={a.href}
            href={a.href}
            aria-current={activo ? "page" : undefined}
            className={`rounded-[10px] px-3 py-1.5 text-xs font-semibold transition ${
              activo ? "bg-white text-marea-700 shadow-sm" : "text-suave hover:text-marea-700"
            }`}
          >
            {a.texto}
          </Link>
        );
      })}
    </div>
  );
}
