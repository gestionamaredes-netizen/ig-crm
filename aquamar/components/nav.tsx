"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ItemNav = { href: string; texto: string };

export function Nav({ items }: { items: ItemNav[] }) {
  const ruta = usePathname();

  return (
    <nav className="-mx-5 overflow-x-auto px-5">
      <ul className="flex min-w-max gap-1 pb-1">
        {items.map((item) => {
          // El tablero raíz solo se marca en coincidencia exacta; el resto por prefijo.
          const activo = ruta === item.href || (item.href !== "/admin" && ruta.startsWith(item.href));
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
