"use client";

import { useMemo, useState } from "react";
import { formatearPesos, parsearMonto, parsearEntero } from "@/lib/formato";

export type ProductoCompra = { id: string; nombre: string; presentacion: string; stock: number };

type Renglon = { cantidad: string; costo: string; iva: string };

const VACIO: Renglon = { cantidad: "", costo: "", iva: "2100" };

const ALICUOTAS = [
  { valor: "2100", texto: "21%" },
  { valor: "1050", texto: "10,5%" },
  { valor: "2700", texto: "27%" },
  { valor: "0", texto: "Sin IVA" },
];

/**
 * Carga de una factura de compra. Los totales se recalculan mientras se
 * escribe: el punto es poder cotejar contra el papel antes de confirmar, que es
 * cuando la mercadería entra al depósito.
 *
 * La cuenta espeja `calcularCompra` del servidor, que es la que vale. Acá es
 * solo para mirar: lo que se guarda lo recalcula el servidor con estos mismos
 * datos.
 */
export function CargaCompra({
  productos,
  ivaRecuperable,
}: {
  productos: ProductoCompra[];
  ivaRecuperable: boolean;
}) {
  const [renglones, setRenglones] = useState<Record<string, Renglon>>({});
  const [percepciones, setPercepciones] = useState("");
  const [otros, setOtros] = useState("");

  const set = (id: string, campo: keyof Renglon, valor: string) =>
    setRenglones((prev) => ({ ...prev, [id]: { ...VACIO, ...prev[id], [campo]: valor } }));

  const resumen = useMemo(() => {
    const activos = productos
      .map((p) => {
        const r = renglones[p.id] ?? VACIO;
        const cantidad = parsearEntero(r.cantidad || "0") ?? 0;
        const costo = parsearMonto(r.costo || "0") ?? 0;
        const alicuota = Number(r.iva || "2100");
        return { id: p.id, cantidad, costo, alicuota, neto: cantidad * costo };
      })
      .filter((r) => r.cantidad > 0);

    const neto = activos.reduce((a, r) => a + r.neto, 0);
    const iva = activos.reduce((a, r) => a + Math.round((r.neto * r.alicuota) / 10000), 0);
    const perc = parsearMonto(percepciones || "0") ?? 0;
    const otr = parsearMonto(otros || "0") ?? 0;
    const extra = perc + otr;
    const unidades = activos.reduce((a, r) => a + r.cantidad, 0);
    const base = neto > 0 ? neto : unidades;

    const costoReal = new Map<string, number>();
    for (const r of activos) {
      const peso = neto > 0 ? r.neto : r.cantidad;
      const prorrateo = base > 0 ? Math.round((extra * peso) / base) : 0;
      const ivaLinea = Math.round((r.neto * r.alicuota) / 10000);
      const linea = r.neto + prorrateo + (ivaRecuperable ? 0 : ivaLinea);
      costoReal.set(r.id, Math.round(linea / r.cantidad));
    }

    return { neto, iva, perc, otr, total: neto + iva + perc + otr, costoReal, cuenta: activos.length };
  }, [productos, renglones, percepciones, otros, ivaRecuperable]);

  return (
    <>
      <section className="min-w-0 rounded-2xl border border-borde bg-white shadow-sm">
        <header className="border-b border-borde px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight">Renglones de la factura</h2>
          <p className="mt-0.5 text-xs text-suave">
            Cargá solo los productos que vinieron. El costo es el <strong>neto</strong>, sin IVA.
          </p>
        </header>
        <ul className="divide-y divide-[#dde7ec]">
          {productos.map((p) => {
            const r = renglones[p.id] ?? VACIO;
            const real = resumen.costoReal.get(p.id);
            return (
              <li key={p.id} className="p-4">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-medium">{p.nombre}</p>
                  <span className="shrink-0 text-xs text-suave">{p.stock} en depósito</span>
                </div>
                <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-suave">Cantidad</span>
                    <input
                      name={`cant_${p.id}`}
                      inputMode="numeric"
                      placeholder="0"
                      value={r.cantidad}
                      onChange={(e) => set(p.id, "cantidad", e.target.value)}
                      className="block w-full min-w-0 rounded-xl border border-borde px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-suave">Costo neto</span>
                    <input
                      name={`costo_${p.id}`}
                      inputMode="decimal"
                      placeholder="0,00"
                      value={r.costo}
                      onChange={(e) => set(p.id, "costo", e.target.value)}
                      className="block w-full min-w-0 rounded-xl border border-borde px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100"
                    />
                  </label>
                  <label className="col-span-2 block min-[420px]:col-span-1">
                    <span className="mb-1 block text-xs font-medium text-suave">IVA</span>
                    <select
                      name={`iva_${p.id}`}
                      value={r.iva}
                      onChange={(e) => set(p.id, "iva", e.target.value)}
                      className="block w-full min-w-0 rounded-xl border border-borde bg-white px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100"
                    >
                      {ALICUOTAS.map((a) => (
                        <option key={a.valor} value={a.valor}>
                          {a.texto}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {real !== undefined && (
                  <p className="mt-2 text-xs text-suave">
                    Costo real puesto en depósito:{" "}
                    <strong className="tabular text-tinta">{formatearPesos(real)}</strong> por unidad
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="min-w-0 rounded-2xl border border-borde bg-white shadow-sm">
        <header className="border-b border-borde px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight">Impuestos y otros costos</h2>
        </header>
        <div className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-suave">Percepciones</span>
              <input
                name="percepciones"
                inputMode="decimal"
                placeholder="0,00"
                value={percepciones}
                onChange={(e) => setPercepciones(e.target.value)}
                className="block w-full min-w-0 rounded-xl border border-borde px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100"
              />
              <span className="mt-1 block text-xs text-suave">IIBB, IVA percepción, etc.</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-suave">Otros costos</span>
              <input
                name="otros"
                inputMode="decimal"
                placeholder="0,00"
                value={otros}
                onChange={(e) => setOtros(e.target.value)}
                className="block w-full min-w-0 rounded-xl border border-borde px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100"
              />
              <span className="mt-1 block text-xs text-suave">Flete, acarreo, embalaje.</span>
            </label>
          </div>

          <dl className="space-y-1.5 rounded-xl bg-fondo p-3 text-sm">
            <Fila etiqueta="Neto" valor={resumen.neto} />
            <Fila etiqueta="IVA" valor={resumen.iva} />
            {resumen.perc !== 0 && <Fila etiqueta="Percepciones" valor={resumen.perc} />}
            {resumen.otr !== 0 && <Fila etiqueta="Otros costos" valor={resumen.otr} />}
            <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-1.5">
              <dt className="font-medium">Total de la factura</dt>
              <dd className="tabular text-base font-semibold">{formatearPesos(resumen.total)}</dd>
            </div>
          </dl>

          <p className="text-xs text-suave">
            {ivaRecuperable
              ? "Como Responsable Inscripto, el IVA es crédito fiscal: no entra al costo de la mercadería."
              : "Como Monotributo, el IVA no se recupera: entra entero al costo de la mercadería."}{" "}
            Las percepciones y los otros costos se reparten entre los renglones a prorrata.
          </p>
        </div>
      </section>
    </>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-suave">{etiqueta}</dt>
      <dd className="tabular">{formatearPesos(valor)}</dd>
    </div>
  );
}
