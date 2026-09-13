"use client";

import { useMemo, useState } from "react";
import { centavosAInput, formatearPesos } from "@/lib/formato";
import { ChipVendedor } from "./chip-vendedor";

export type VendedorDePedido = {
  id: string;
  nombre: string;
  color: string;
  modalidad: string;
  comisionPorBultoCentavos: number;
};

export type ClienteDePedido = {
  id: string;
  comercio: string;
  vendedor: VendedorDePedido | null;
};

const clase =
  "block w-full min-w-0 rounded-xl border border-borde bg-white px-3 py-2.5 text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100";

/**
 * El comercio y, pegado a él, quién lo atiende y cuánto se lleva por esta
 * venta.
 *
 * Van juntos porque son la misma decisión: el vendedor no se elige, se deduce
 * del comercio —por eso aparece solo apenas se lo elige—, y recién sabiendo
 * quién es tiene sentido preguntar qué comisión lleva el pedido.
 */
export function SelectorClienteComision({
  clientes,
  defaultClienteId = "",
}: {
  clientes: ClienteDePedido[];
  defaultClienteId?: string;
}) {
  const [clienteId, setClienteId] = useState(defaultClienteId);
  const [modo, setModo] = useState("fija");
  const [monto, setMonto] = useState("");

  const vendedor = useMemo(() => clientes.find((c) => c.id === clienteId)?.vendedor ?? null, [clientes, clienteId]);
  const aComision = vendedor?.modalidad === "comisión";
  const tieneFija = (vendedor?.comisionPorBultoCentavos ?? 0) > 0;

  const cambiarCliente = (id: string) => {
    setClienteId(id);
    // Lo arreglado con un vendedor no vale para otro: se vuelve a la fija.
    setModo("fija");
    setMonto("");
  };

  return (
    <>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-suave">Comercio</span>
        <select
          name="clienteId"
          value={clienteId}
          onChange={(e) => cambiarCliente(e.target.value)}
          required
          className={clase}
        >
          <option value="" disabled>
            Elegí un comercio
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.comercio}
            </option>
          ))}
        </select>
      </label>

      <div className="flex min-h-11 flex-wrap items-center gap-2 text-sm sm:items-end">
        {!clienteId ? (
          <span className="text-suave">Elegí el comercio y aparece quién lo atiende.</span>
        ) : vendedor ? (
          <>
            <span className="text-suave">Lo atiende</span>
            <ChipVendedor nombre={vendedor.nombre} color={vendedor.color} />
            <span className="text-suave">
              {aComision
                ? tieneFija
                  ? `· ${formatearPesos(vendedor.comisionPorBultoCentavos)} por bulto`
                  : "· todavía sin comisión fija"
                : "· sub-distribuidor, no se le liquida comisión"}
            </span>
          </>
        ) : (
          <span className="text-suave">Sin comisionista activo: este pedido no paga comisión.</span>
        )}
      </div>

      {aComision && (
        <>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-suave">Comisión de este pedido</span>
            <select name="comisionModo" value={modo} onChange={(e) => setModo(e.target.value)} className={clase}>
              <option value="fija">
                {tieneFija
                  ? `La fija: ${formatearPesos(vendedor!.comisionPorBultoCentavos)} por bulto`
                  : "La fija (no tiene ninguna cargada: no paga comisión)"}
              </option>
              <option value="nueva_fija">Cargarle la fija ahora</option>
              <option value="extraordinaria">Extraordinaria, solo por esta venta</option>
            </select>
          </label>

          {modo !== "fija" && (
            <div className="grid gap-3 rounded-xl border border-celeste-300 bg-azul-50 p-3 sm:col-span-2 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-suave">Importe</span>
                <input
                  name="comisionMonto"
                  inputMode="decimal"
                  placeholder={centavosAInput(vendedor!.comisionPorBultoCentavos || 50000)}
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className={clase}
                  required
                />
              </label>

              {modo === "extraordinaria" && (
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-suave">Ese importe es</span>
                  <select name="comisionUnidad" defaultValue="bulto" className={clase}>
                    <option value="bulto">Por cada bulto</option>
                    <option value="total">Por todo el pedido</option>
                  </select>
                </label>
              )}

              <p className="self-end text-xs text-suave sm:col-span-1">
                {modo === "nueva_fija"
                  ? `Queda como la comisión fija de ${vendedor!.nombre} de ahora en más.`
                  : `Vale solo para este pedido. La fija de ${vendedor!.nombre} no se toca.`}
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}
