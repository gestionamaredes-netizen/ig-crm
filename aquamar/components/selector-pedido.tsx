"use client";

import { useMemo, useState } from "react";
import { centavosAInput, formatearPesos, parsearEntero, parsearMonto } from "@/lib/formato";

export type EscalaVista = { desdeCantidad: number; precioCentavos: number; nombre: string };

export type ProductoPedido = {
  id: string;
  nombre: string;
  presentacion: string;
  libre: number;
  precioLista: number;
  escalas: EscalaVista[];
};

/** Espeja `precioParaCantidad` del servidor, que es la que decide al guardar. */
function escalaQueAplica(cantidad: number, escalas: EscalaVista[]): EscalaVista | null {
  let elegida: EscalaVista | null = null;
  for (const e of escalas) {
    if (cantidad >= e.desdeCantidad && (!elegida || e.desdeCantidad >= elegida.desdeCantidad)) elegida = e;
  }
  return elegida;
}

/**
 * Renglones del pedido. El precio se sugiere solo según la cantidad, pero queda
 * editable: la escala es la regla, no una jaula. Si se toca a mano, deja de
 * seguir a la sugerencia hasta que se vuelva a pedir.
 */
export function SelectorPedido({ productos }: { productos: ProductoPedido[] }) {
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [precios, setPrecios] = useState<Record<string, string>>({});
  const [aMano, setAMano] = useState<Record<string, boolean>>({});

  const filas = useMemo(
    () =>
      productos.map((p) => {
        const cantidad = parsearEntero(cantidades[p.id] || "0") ?? 0;
        const escala = cantidad > 0 ? escalaQueAplica(cantidad, p.escalas) : null;
        const sugerido = escala ? escala.precioCentavos : p.precioLista;
        const escrito = aMano[p.id] ? (parsearMonto(precios[p.id] || "0") ?? 0) : sugerido;
        return { p, cantidad, escala, sugerido, precio: escrito, subtotal: cantidad * escrito };
      }),
    [productos, cantidades, precios, aMano],
  );

  const total = filas.reduce((a, f) => a + f.subtotal, 0);
  const unidades = filas.reduce((a, f) => a + f.cantidad, 0);

  const setCantidad = (id: string, valor: string) => setCantidades((prev) => ({ ...prev, [id]: valor }));

  const setPrecio = (id: string, valor: string) => {
    setAMano((prev) => ({ ...prev, [id]: true }));
    setPrecios((prev) => ({ ...prev, [id]: valor }));
  };

  const volverASugerido = (id: string) => {
    setAMano((prev) => ({ ...prev, [id]: false }));
    setPrecios((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <>
      <section className="min-w-0 rounded-2xl border border-borde bg-white shadow-sm">
        <header className="border-b border-borde px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight">Productos</h2>
        </header>
        <ul className="divide-y divide-[#dde7ec]">
          {filas.map(({ p, cantidad, escala, sugerido, subtotal }) => (
            <li key={p.id} className="p-4">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium">{p.nombre}</p>
                <span className="shrink-0 text-xs text-suave">{p.libre} libres</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-suave">Cantidad</span>
                  <input
                    name={`cant_${p.id}`}
                    inputMode="numeric"
                    placeholder="0"
                    value={cantidades[p.id] ?? ""}
                    onChange={(e) => setCantidad(p.id, e.target.value)}
                    className="block w-full min-w-0 rounded-xl border border-borde px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-suave">Precio unitario</span>
                  <input
                    name={`precio_${p.id}`}
                    inputMode="decimal"
                    value={aMano[p.id] ? (precios[p.id] ?? "") : centavosAInput(sugerido)}
                    onChange={(e) => setPrecio(p.id, e.target.value)}
                    className="block w-full min-w-0 rounded-xl border border-borde px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100"
                  />
                </label>
              </div>

              {cantidad > 0 && (
                <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-suave">
                  <span>
                    {escala ? (
                      <>
                        Escala <strong className="text-tinta">{escala.nombre}</strong>
                      </>
                    ) : (
                      "Precio de lista"
                    )}
                    {": "}
                    {formatearPesos(sugerido)}
                  </span>
                  {aMano[p.id] && (
                    <button
                      type="button"
                      onClick={() => volverASugerido(p.id)}
                      className="toque font-medium text-azul-700"
                    >
                      Volver al sugerido
                    </button>
                  )}
                  <span className="ml-auto">
                    Subtotal: <strong className="tabular text-tinta">{formatearPesos(subtotal)}</strong>
                  </span>
                </p>
              )}

              {cantidad > p.libre && (
                <p className="mt-2 text-xs text-rose-700">
                  Ojo: hay {p.libre} libres. El pedido se puede cargar igual, pero no vas a poder entregarlo hasta
                  reponer.
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex items-baseline justify-between gap-3 rounded-2xl border border-borde bg-white p-4 shadow-sm">
        <span className="text-sm text-suave">{unidades} unidades</span>
        <span className="tabular text-base font-semibold">{formatearPesos(total)}</span>
      </div>
    </>
  );
}
