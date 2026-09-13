"use client";

import { useState } from "react";
import { COLORES_VENDEDOR, VENDEDOR_NUEVO } from "@/lib/db/schema";
import { ChipVendedor } from "./chip-vendedor";

export type VendedorElegible = { id: string; nombre: string; color: string };

const clase =
  "block w-full min-w-0 rounded-xl border border-borde bg-white px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100";

function BloqueNuevo() {
  return (
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
  );
}

/**
 * Quién cobra por este comercio hoy. Se cambia y se saca: sacarlo no borra de
 * dónde vino el comercio, solo deja de generar comisión de acá en más.
 */
export function SelectorComisionista({
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
        <span className="mb-1 block text-xs font-medium text-suave">Comisionista activo</span>
        <select
          name="comisionistaId"
          value={elegido}
          onChange={(e) => setElegido(e.target.value)}
          className={clase}
        >
          <option value="">Ninguno — no se liquida comisión</option>
          {vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
          <option value={VENDEDOR_NUEVO}>+ Cargar un vendedor nuevo…</option>
        </select>
        <span className="mt-1 block text-xs text-suave">
          Quién cobra por este comercio de ahora en más. Se puede cambiar o dejar en ninguno.
        </span>
      </label>

      {elegido === VENDEDOR_NUEVO && <BloqueNuevo />}
    </>
  );
}

/**
 * Quién trajo el comercio. Es historia, no configuración: se muestra escrito y
 * hay que pedir corregirlo a propósito. Un campo suelto se cambia sin querer, y
 * este dato es justamente el que no tiene que moverse cuando el comercio pasa
 * de manos.
 */
export function VendedorDeOrigen({
  vendedores,
  actual,
}: {
  vendedores: VendedorElegible[];
  actual: VendedorElegible | null;
}) {
  const [corrigiendo, setCorrigiendo] = useState(false);

  if (!corrigiendo) {
    return (
      <div className="block">
        <span className="mb-1 block text-xs font-medium text-suave">Vendedor de origen</span>
        <div className="flex min-h-11 flex-wrap items-center gap-2">
          {actual ? (
            <ChipVendedor nombre={actual.nombre} color={actual.color} />
          ) : (
            <span className="text-sm text-suave">Sin registrar</span>
          )}
          <button
            type="button"
            onClick={() => setCorrigiendo(true)}
            className="toque text-xs font-medium text-azul-700"
          >
            Corregir
          </button>
        </div>
        <span className="mt-1 block text-xs text-suave">Quién lo trajo. Queda como dato histórico.</span>
      </div>
    );
  }

  return (
    <>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-suave">Vendedor de origen</span>
        <select name="vendedorOrigenId" defaultValue={actual?.id ?? ""} className={clase}>
          <option value="">Sin registrar</option>
          {vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-suave">
          Corregilo solo si estaba mal cargado: el cambio queda en la bitácora.
        </span>
      </label>
    </>
  );
}
