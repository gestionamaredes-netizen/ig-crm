"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type ItemNav = { href: string; texto: string };

/** Pestañas de la sección actual. */
export function Nav({ items, raiz }: { items: ItemNav[]; raiz?: string }) {
  const ruta = usePathname();
  const caja = useRef<HTMLElement>(null);

  /*
   * Con muchas solapas la barra scrollea, y en un celular la activa puede
   * quedar fuera de pantalla al entrar: sin esto, quien abre Compras no ve en
   * qué sección está parado.
   */
  useEffect(() => {
    const activa = caja.current?.querySelector('[aria-current="page"]');
    activa?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [ruta]);

  return (
    <nav ref={caja} className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
      <ul className="flex min-w-max gap-1 pb-1">
        {items.map((item) => {
          // La raíz del área solo se marca en coincidencia exacta; el resto por prefijo.
          const activo = ruta === item.href || (item.href !== raiz && ruta.startsWith(`${item.href}/`));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={activo ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-medium transition ${
                  activo ? "bg-azul-600 text-white" : "text-suave hover:bg-azul-50 hover:text-azul-700"
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
    <div className="flex shrink-0 rounded-xl border border-borde bg-fondo p-0.5">
      {areas.map((a) => {
        const activo = ruta === a.href || ruta.startsWith(`${a.href}/`);
        return (
          <Link
            key={a.href}
            href={a.href}
            aria-current={activo ? "page" : undefined}
            className={`inline-flex min-h-9 items-center rounded-[10px] px-3 py-2 text-xs font-semibold transition ${
              activo ? "bg-white text-azul-700 shadow-sm" : "text-suave hover:text-azul-700"
            }`}
          >
            {a.texto}
          </Link>
        );
      })}
    </div>
  );
}
