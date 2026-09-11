import { Aviso, Boton, Campo, CampoSelect, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { ChipVendedor } from "@/components/chip-vendedor";
import { centavosAInput, formatearFecha, formatearPesos, hoy, inicioDeMes, textoBultos } from "@/lib/formato";
import { COLORES_VENDEDOR, FORMAS_COBRO, MODALIDADES_VENDEDOR } from "@/lib/db/schema";
import { listarVendedores, liquidacion, pagosDeVendedor } from "@/lib/datos/vendedores";
import { listarListas } from "@/lib/datos/precios";
import { accionActualizarVendedor, accionCrearVendedor, accionEliminarPagoComision, accionPagarComision } from "../actions";
import { BotonBorrar } from "@/components/boton-borrar";

export const dynamic = "force-dynamic";

/**
 * El saldo, dicho como se dice en el mostrador. En negativo no es una deuda de
 * signo cambiado: es plata que se le adelantó, y escribir "se le debe -$1.000"
 * obliga a traducir de la cabeza algo que se puede decir bien de una.
 */
function estadoDeCuenta(saldoCentavos: number): string {
  if (saldoCentavos > 0) return `se le debe ${formatearPesos(saldoCentavos)}`;
  if (saldoCentavos < 0) return `tiene ${formatearPesos(-saldoCentavos)} a favor`;
  return "está al día";
}

export default async function Vendedores({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; error?: string }>;
}) {
  const { desde, hasta, error } = await searchParams;
  const rango = { desde: desde || inicioDeMes(), hasta: hasta || hoy() };

  const vendedores = await listarVendedores();
  const listas = (await listarListas()).filter((l) => l.activo);
  const lineas = await liquidacion(rango);
  const aPagar = lineas.reduce((acc, l) => acc + l.comisionCentavos, 0);
  const seDebe = lineas.reduce((acc, l) => acc + Math.max(0, l.saldoCentavos), 0);
  const pagos = new Map(
    await Promise.all(vendedores.map(async (v) => [v.id, await pagosDeVendedor(v.id, 8)] as const)),
  );
  const saldos = new Map(lineas.map((l) => [l.vendedor.id, l.saldoCentavos]));
  const saldoDe = (id: string) => saldos.get(id) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Vendedores</h1>
        <p className="text-sm text-suave">
          Quién atiende a cada comercio, con qué precios y cuánto se le paga. La comisión de un pedido queda
          congelada al cargarlo.
        </p>
      </div>

      {error && <Aviso texto={error} />}

      <Tarjeta titulo="Liquidación del período">
        <form className="mb-4 flex flex-wrap items-end gap-3">
          <Campo etiqueta="Desde" name="desde" type="date" defaultValue={rango.desde} />
          <Campo etiqueta="Hasta" name="hasta" type="date" defaultValue={rango.hasta} />
          <Boton type="submit" variante="secundario">
            Aplicar
          </Boton>
        </form>

        {lineas.length === 0 ? (
          <Vacio>Todavía no cargaste vendedores.</Vacio>
        ) : (
          <>
            <Tabla>
              <thead>
                <tr>
                  <Th>Vendedor</Th>
                  <Th alinear="right">Comercios</Th>
                  <Th alinear="right">Entregados</Th>
                  <Th alinear="right">Vendido</Th>
                  <Th alinear="right">Comisión</Th>
                  <Th alinear="right">Pagado</Th>
                  <Th alinear="right">Se le debe</Th>
                </tr>
              </thead>
              <tbody>
                {lineas.map((l) => (
                  <tr key={l.vendedor.id} className={l.vendedor.activo ? "" : "opacity-50"}>
                    <Td>
                      <ChipVendedor nombre={l.vendedor.nombre} color={l.vendedor.color} />
                      <span className="mt-1 block text-xs text-suave">
                        {l.vendedor.modalidad === "comisión"
                          ? `${formatearPesos(l.vendedor.comisionPorBultoCentavos)} por bulto`
                          : "sub-distribuidor, sin comisión"}
                      </span>
                    </Td>
                    <Td alinear="right">{l.comercios}</Td>
                    <Td alinear="right">
                      {l.pedidos}
                      {l.unidades > 0 && (
                        <span className="block text-xs text-suave">{textoBultos(l.unidades, 12)}</span>
                      )}
                    </Td>
                    <Td alinear="right">
                      <Plata centavos={l.ventasCentavos} />
                    </Td>
                    <Td alinear="right">
                      {l.vendedor.modalidad === "comisión" ? <Plata centavos={l.comisionCentavos} /> : "—"}
                    </Td>
                    <Td alinear="right">
                      {l.pagadoCentavos > 0 ? <Plata centavos={l.pagadoCentavos} /> : "—"}
                    </Td>
                    <Td alinear="right">
                      {l.vendedor.modalidad !== "comisión" ? (
                        "—"
                      ) : l.saldoCentavos > 0 ? (
                        <Plata centavos={l.saldoCentavos} />
                      ) : (
                        <span className="text-xs text-suave">{estadoDeCuenta(l.saldoCentavos)}</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>

            <dl className="mt-4 space-y-1 border-t border-borde pt-3 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-suave">Comisión ganada en el período</dt>
                <dd className="tabular">{formatearPesos(aPagar)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-1.5">
                <dt className="font-medium">Se debe hoy, en total</dt>
                <dd className="tabular text-base font-semibold">{formatearPesos(seDebe)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-suave">
              La comisión del período cuenta solo pedidos entregados entre esas fechas: se gana cuando la mercadería
              llegó, no cuando se cargó el pedido. Lo que se debe, en cambio, mira toda la historia —lo ganado menos
              lo pagado—, porque la comisión de un mes se suele pagar al siguiente.
            </p>
          </>
        )}
      </Tarjeta>

      <Tarjeta titulo="Agregar vendedor">
        <form action={accionCrearVendedor} className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Nombre" name="nombre" placeholder="Mati Titán" required />
          <CampoSelect etiqueta="Color" name="color" defaultValue="azul">
            {COLORES_VENDEDOR.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </CampoSelect>
          <CampoSelect etiqueta="Cómo trabaja" name="modalidad" defaultValue="comisión">
            {MODALIDADES_VENDEDOR.map((m) => (
              <option key={m} value={m}>
                {m === "comisión" ? "A comisión (le pagamos por bulto)" : "Sub-distribuidor (compra y revende)"}
              </option>
            ))}
          </CampoSelect>
          <Campo
            etiqueta="Comisión por bulto"
            name="comisionPorBulto"
            inputMode="decimal"
            placeholder="500,00"
            ayuda="Solo si trabaja a comisión"
          />
          <CampoSelect etiqueta="Lista de precios de sus comercios" name="listaPrecioId" defaultValue="">
            <option value="">La predeterminada</option>
            {listas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </CampoSelect>
          <Campo etiqueta="Teléfono" name="telefono" inputMode="tel" />
          <div className="sm:col-span-2">
            <Campo etiqueta="Notas" name="notas" placeholder="Zona, días que pasa, condiciones…" />
          </div>
          <div className="sm:col-span-2">
            <Boton type="submit">Agregar</Boton>
          </div>
        </form>
      </Tarjeta>

      {vendedores.map((v) => (
        <Tarjeta key={v.id} className={v.activo ? "" : "opacity-60"}>
          <form action={accionActualizarVendedor} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={v.id} />
            <div className="sm:col-span-2">
              <ChipVendedor nombre={v.nombre} color={v.color} />
            </div>
            <Campo etiqueta="Nombre" name="nombre" defaultValue={v.nombre} required />
            <CampoSelect etiqueta="Color" name="color" defaultValue={v.color}>
              {COLORES_VENDEDOR.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </CampoSelect>
            <CampoSelect etiqueta="Cómo trabaja" name="modalidad" defaultValue={v.modalidad}>
              {MODALIDADES_VENDEDOR.map((m) => (
                <option key={m} value={m}>
                  {m === "comisión" ? "A comisión (le pagamos por bulto)" : "Sub-distribuidor (compra y revende)"}
                </option>
              ))}
            </CampoSelect>
            <Campo
              etiqueta="Comisión por bulto"
              name="comisionPorBulto"
              inputMode="decimal"
              defaultValue={centavosAInput(v.comisionPorBultoCentavos)}
              ayuda="Solo si trabaja a comisión"
            />
            <CampoSelect etiqueta="Lista de precios de sus comercios" name="listaPrecioId" defaultValue={v.listaPrecioId ?? ""}>
              <option value="">La predeterminada</option>
              {listas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </CampoSelect>
            <Campo etiqueta="Teléfono" name="telefono" inputMode="tel" defaultValue={v.telefono} />
            <div className="sm:col-span-2">
              <Campo etiqueta="Notas" name="notas" defaultValue={v.notas} />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Boton type="submit" variante="secundario">
                Guardar
              </Boton>
              <Boton type="submit" name="activo" value={v.activo ? "no" : "si"} variante="secundario">
                {v.activo ? "Dar de baja" : "Reactivar"}
              </Boton>
            </div>
          </form>
          <p className="mt-3 text-xs text-suave">
            Cambiar la comisión afecta a los pedidos que se carguen de ahora en más. Los que ya están cargados
            conservan la que tenían.
          </p>

          {v.modalidad === "comisión" && (
            <div className="mt-4 border-t border-borde pt-4">
              <p className="mb-3 text-sm font-medium">
                Pagarle la comisión
                <span className="ml-2 font-normal text-suave">{estadoDeCuenta(saldoDe(v.id))}</span>
              </p>

              <form action={accionPagarComision} className="grid gap-3 sm:grid-cols-4">
                <input type="hidden" name="vendedorId" value={v.id} />
                <Campo
                  etiqueta="Monto"
                  name="monto"
                  inputMode="decimal"
                  defaultValue={centavosAInput(Math.max(0, saldoDe(v.id)))}
                  ayuda="Viene lo que se le debe, pero podés pagarle una parte"
                  required
                />
                <CampoSelect etiqueta="Cómo le pagás" name="forma" defaultValue="efectivo">
                  {FORMAS_COBRO.map((f) => (
                    <option key={f} value={f}>
                      {f[0].toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </CampoSelect>
                <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
                <div className="flex items-end">
                  <Boton type="submit" className="w-full">
                    Registrar pago
                  </Boton>
                </div>
                <div className="sm:col-span-4">
                  <Campo etiqueta="Detalle" name="notas" placeholder="Opcional" />
                </div>
              </form>

              {(pagos.get(v.id) ?? []).length > 0 && (
                <ul className="mt-3 space-y-2">
                  {(pagos.get(v.id) ?? []).map((pago) => (
                    <li
                      key={pago.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-borde px-3 py-2 text-sm"
                    >
                      <span className="text-suave">
                        {formatearFecha(pago.fecha)} · {pago.forma}
                        {pago.notas && ` · ${pago.notas}`}
                      </span>
                      <span className="flex items-center gap-3">
                        <strong className="tabular">{formatearPesos(pago.montoCentavos)}</strong>
                        <form action={accionEliminarPagoComision}>
                          <input type="hidden" name="id" value={pago.id} />
                          <BotonBorrar
                            pregunta={`Se borra el pago de ${formatearPesos(pago.montoCentavos)} a ${v.nombre} y la plata vuelve a la caja. No se puede deshacer.`}
                          >
                            Borrar
                          </BotonBorrar>
                        </form>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-2 text-xs text-suave">
                El pago sale de la caja en el mismo movimiento: no hay que anotarlo también como gasto.
              </p>
            </div>
          )}
        </Tarjeta>
      ))}
    </div>
  );
}
