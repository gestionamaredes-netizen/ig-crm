"use client";

import { useMemo, useState } from "react";
import {
  centavosAInput,
  desdeBultos,
  formatearPesos,
  parsearEntero,
  parsearMonto,
  precioPorUnidad,
} from "@/lib/formato";

export type EscalaVista = { desdeCantidad: number; precioCentavos: number; nombre: string };

export type ProductoPedido = {
  id: string;
  nombre: string;
  presentacion: string;
  /** Cuántos envases trae un bulto. 1 o menos significa que se vende suelto. */
  unidadesPorBulto: number;
  libre: number;
  precioLista: number;
  /** Costo promedio del depósito, para estimar el margen antes de confirmar. */
  costo: number;
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
 *
 * La venta se carga en bultos o en unidades sueltas, a elección de cada
 * renglón: en el mostrador se vende de las dos maneras. Adentro el pedido
 * siempre queda en unidades —es lo que se descuenta del depósito y lo que mide
 * las escalas—, así que la conversión se muestra en pantalla para que nadie
 * tenga que confiar en que el sistema multiplicó bien.
 */
export function SelectorPedido({ productos }: { productos: ProductoPedido[] }) {
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [precios, setPrecios] = useState<Record<string, string>>({});
  const [aMano, setAMano] = useState<Record<string, boolean>>({});
  const [medidas, setMedidas] = useState<Record<string, string>>({});

  const filas = useMemo(
    () =>
      productos.map((p) => {
        const porBulto = Math.max(1, p.unidadesPorBulto);
        // Un producto que no viene en bultos se carga suelto y no se pregunta.
        const enBultos = porBulto > 1 && (medidas[p.id] ?? "bultos") === "bultos";
        const escrito = parsearEntero(cantidades[p.id] || "0") ?? 0;
        const cantidad = enBultos ? desdeBultos(escrito, porBulto) : escrito;

        const escala = cantidad > 0 ? escalaQueAplica(cantidad, p.escalas) : null;
        const sugeridoUnitario = escala ? escala.precioCentavos : p.precioLista;
        // Lo que se escribe en el campo está en la misma medida que la cantidad.
        const sugerido = enBultos ? sugeridoUnitario * porBulto : sugeridoUnitario;
        const puesto = aMano[p.id] ? (parsearMonto(precios[p.id] || "0") ?? 0) : sugerido;
        const precio = enBultos ? precioPorUnidad(puesto, porBulto) : puesto;

        return {
          p,
          porBulto,
          enBultos,
          bultos: escrito,
          cantidad,
          escala,
          sugerido,
          sugeridoUnitario,
          precio,
          subtotal: cantidad * precio,
          margen: cantidad * (precio - p.costo),
        };
      }),
    [productos, cantidades, precios, aMano, medidas],
  );

  const total = filas.reduce((a, f) => a + f.subtotal, 0);
  const unidades = filas.reduce((a, f) => a + f.cantidad, 0);
  const margen = filas.reduce((a, f) => a + f.margen, 0);
  const margenPorcentual = total > 0 ? (margen / total) * 100 : null;

  const setCantidad = (id: string, valor: string) => setCantidades((prev) => ({ ...prev, [id]: valor }));

  const setPrecio = (id: string, valor: string) => {
    setAMano((prev) => ({ ...prev, [id]: true }));
    setPrecios((prev) => ({ ...prev, [id]: valor }));
  };

  const volverASugerido = (id: string) => {
    setAMano((prev) => ({ ...prev, [id]: false }));
    setPrecios((prev) => ({ ...prev, [id]: "" }));
  };

  /*
   * Cambiar de medida cambia qué significa el número del precio: lo que era el
   * precio de una unidad pasaría a leerse como el de un bulto entero. Se vuelve
   * al sugerido para que no quede un precio doce veces más caro sin que nadie
   * lo haya escrito.
   */
  const setMedida = (id: string, valor: string) => {
    setMedidas((prev) => ({ ...prev, [id]: valor }));
    volverASugerido(id);
  };

  const clase =
    "block w-full min-w-0 rounded-xl border border-borde px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100";

  return (
    <>
      <section className="min-w-0 rounded-2xl border border-borde bg-white shadow-sm">
        <header className="border-b border-borde px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight">Productos</h2>
        </header>
        <ul className="divide-y divide-[#dde7ec]">
          {filas.map(({ p, porBulto, enBultos, bultos, cantidad, escala, sugerido, sugeridoUnitario, precio, subtotal, margen: margenLinea }) => (
            <li key={p.id} className="p-4">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium">{p.nombre}</p>
                <span className="shrink-0 text-xs text-suave">{p.libre} libres</span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-suave">
                    {enBultos ? "Bultos" : "Unidades"}
                  </span>
                  <input
                    name={`cant_${p.id}`}
                    inputMode="numeric"
                    placeholder="0"
                    value={cantidades[p.id] ?? ""}
                    onChange={(e) => setCantidad(p.id, e.target.value)}
                    className={clase}
                  />
                </label>

                {porBulto > 1 ? (
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-suave">Se vende por</span>
                    <select
                      name={`medida_${p.id}`}
                      value={medidas[p.id] ?? "bultos"}
                      onChange={(e) => setMedida(p.id, e.target.value)}
                      className={clase}
                    >
                      <option value="bultos">Bulto ({porBulto} u.)</option>
                      <option value="unidades">Unidad suelta</option>
                    </select>
                  </label>
                ) : (
                  <input type="hidden" name={`medida_${p.id}`} value="unidades" />
                )}

                <label className={`block ${porBulto > 1 ? "col-span-2 sm:col-span-1" : ""}`}>
                  <span className="mb-1 block text-xs font-medium text-suave">
                    {enBultos ? "Precio por bulto" : "Precio unitario"}
                  </span>
                  <input
                    name={`precio_${p.id}`}
                    inputMode="decimal"
                    value={aMano[p.id] ? (precios[p.id] ?? "") : centavosAInput(sugerido)}
                    onChange={(e) => setPrecio(p.id, e.target.value)}
                    className={clase}
                  />
                </label>
              </div>

              {cantidad > 0 && (
                <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-suave">
                  {enBultos && (
                    <span className="w-full">
                      {bultos} {bultos === 1 ? "bulto" : "bultos"} ={" "}
                      <strong className="text-tinta">{cantidad} unidades</strong> a{" "}
                      <strong className="text-tinta">{formatearPesos(precio)}</strong> cada una
                    </span>
                  )}
                  <span>
                    {escala ? (
                      <>
                        Escala <strong className="text-tinta">{escala.nombre}</strong>
                      </>
                    ) : (
                      "Precio de lista"
                    )}
                    {": "}
                    {formatearPesos(sugeridoUnitario)} por unidad
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
                  {p.costo > 0 && (
                    <span className="w-full">
                      Margen:{" "}
                      <strong className={`tabular ${margenLinea < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                        {formatearPesos(margenLinea)}
                      </strong>
                    </span>
                  )}
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

      <div className="space-y-1.5 rounded-2xl border border-borde bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-suave">{unidades} unidades</span>
          <span className="tabular text-base font-semibold">{formatearPesos(total)}</span>
        </div>
        {/* El margen es estimado: sale del costo promedio de hoy, y los gastos
            de flete de este pedido todavía no existen. */}
        <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-1.5 text-sm">
          <span className="text-suave">Margen estimado</span>
          <span className={`tabular font-medium ${margen < 0 ? "text-rose-700" : "text-emerald-700"}`}>
            {formatearPesos(margen)}
            {margenPorcentual !== null && ` (${margenPorcentual.toFixed(1)}%)`}
          </span>
        </div>
        <p className="text-xs text-suave">
          Sobre el costo promedio de hoy, antes de los gastos que se imputen a la entrega.
        </p>
      </div>
    </>
  );
}
