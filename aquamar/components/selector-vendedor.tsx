"use client";

import { useState } from "react";
import { COLORES_VENDEDOR, VENDEDOR_NUEVO } from "@/lib/db/schema";

export type VendedorElegible = { id: string; nombre: string };

const clase =
  "block w-full min-w-0 rounded-xl border border-borde bg-white px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100";

/**
 * A quién pertenece el comercio, con la salida de cargar un vendedor que
 * todavía no existe sin irse de la pantalla: cuando entra un comercio nuevo de
 * la mano de alguien nuevo, mandar a la persona a otra pantalla y que vuelva es
 * la forma más segura de que el comercio quede sin dueño.
 */
export function SelectorVendedor({
  vendedores,
  defaultValue = "",
}: {
  vendedores: VendedorElegible[];
  defaultValue?: string;
}) {
  const [elegido, setElegido] = useState(defaultValue);

  return (
    <>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-suave">Vendedor</span>
        <select
          name="vendedorId"
          value={elegido}
          onChange={(e) => setElegido(e.target.value)}
          className={clase}
        >
          <option value="">Lo atiende la casa</option>
          {vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
          <option value={VENDEDOR_NUEVO}>+ Cargar un vendedor nuevo…</option>
        </select>
      </label>

      {elegido === VENDEDOR_NUEVO && (
        <div className="grid gap-3 rounded-xl border border-celeste-300 bg-azul-50 p-3 sm:col-span-2 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-suave">Nombre del vendedor</span>
            <input name="vendedorNuevoNombre" placeholder="Mati Titán" className={clase} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-suave">Color</span>
            <select name="vendedorNuevoColor" defaultValue="azul" className={clase}>
              {COLORES_VENDEDOR.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-suave">Comisión por bulto</span>
            <input name="vendedorNuevaComision" inputMode="decimal" placeholder="500,00" className={clase} />
          </label>
          <p className="text-xs text-suave sm:col-span-3">
            Se crea a comisión. Si en realidad compra y revende, cambialo después en Vendedores.
          </p>
        </div>
      )}
    </>
  );
}
