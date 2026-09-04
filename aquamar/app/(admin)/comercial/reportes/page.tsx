import Link from "next/link";
import { Aviso, Boton, Campo, CampoSelect, Kpi, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { estimar } from "@/lib/datos/impuestos";
import { NOMBRE_REGIMEN, leerNumero, preciosConIva } from "@/lib/datos/config";
import { accionGuardarImpuestos } from "../actions";
import { formatearFecha, formatearPesos, hoy, inicioDeMes } from "@/lib/formato";
import {
  bajaRotacion,
  indicadores,
  gastosPorCategoria,
  rentabilidadPorCliente,
  rentabilidadPorPedido,
  rentabilidadPorProducto,
  resumen,
} from "@/lib/datos/reportes";

export const dynamic = "force-dynamic";

export default async function Reportes({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { desde, hasta } = await searchParams;
  const rango = { desde: desde || inicioDeMes(), hasta: hasta || hoy() };

  const r = await resumen(rango);
  const porPedido = await rentabilidadPorPedido(rango);
  const porProducto = await rentabilidadPorProducto(rango);
  const porCliente = await rentabilidadPorCliente(rango);
  const categorias = await gastosPorCategoria(rango);
  const kpis = indicadores(r);
  const sinRotacion = await bajaRotacion(rango);
  const impuestos = await estimar(rango);
  const ajustes = {
    conIva: await preciosConIva(),
    alicuotaVentas: await leerNumero("alicuotaVentas"),
    diasDeCobertura: await leerNumero("diasDeCobertura"),
  };

  /** Las alícuotas se guardan en centésimos de punto y se muestran en porcentaje. */
  const enPorcentaje = (centesimos: number) => (centesimos / 100).toString().replace(".", ",");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Reportes</h1>
        <p className="text-sm text-suave">Rentabilidad sobre pedidos entregados en el período.</p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-borde bg-white p-4 shadow-sm">
        <Campo etiqueta="Desde" name="desde" type="date" defaultValue={rango.desde} />
        <Campo etiqueta="Hasta" name="hasta" type="date" defaultValue={rango.hasta} />
        <Boton type="submit" variante="secundario">
          Aplicar
        </Boton>
      </form>

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
        <Kpi etiqueta="Ventas" valor={formatearPesos(r.ingresosCentavos)} detalle={`${r.pedidosEntregados} pedidos entregados`} />
        <Kpi etiqueta="Costo de mercadería" valor={formatearPesos(r.costoCentavos)} detalle={`${r.unidades} unidades`} />
        <Kpi
          etiqueta="Margen bruto"
          valor={formatearPesos(r.margenBruto)}
          tono="bueno"
          detalle={r.margenPorcentual !== null ? `${r.margenPorcentual.toFixed(1)}% sobre ventas` : undefined}
        />
        <Kpi
          etiqueta="Resultado neto"
          valor={formatearPesos(r.neto)}
          tono={r.neto >= 0 ? "bueno" : "malo"}
          detalle={r.netoPorcentual !== null ? `${r.netoPorcentual.toFixed(1)}% sobre ventas` : undefined}
        />
      </div>

      <Tarjeta titulo="Cómo se llega al neto">
        <dl className="space-y-1 text-sm">
          <Fila etiqueta="Ventas entregadas" centavos={r.ingresosCentavos} />
          <Fila etiqueta="Costo de la mercadería" centavos={-r.costoCentavos} />
          <div className="flex justify-between border-t border-borde pt-1 font-medium">
            <dt>Margen bruto</dt>
            <dd>
              <Plata centavos={r.margenBruto} tono />
            </dd>
          </div>
          <Fila etiqueta="Gastos operativos" centavos={-r.gastosOperativos} />
          <Fila etiqueta="Gastos logísticos" centavos={-r.gastosLogisticos} />
          <div className="flex justify-between border-t border-borde pt-1 font-semibold">
            <dt>Resultado neto</dt>
            <dd>
              <Plata centavos={r.neto} tono />
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-suave">
          De los gastos del período, {formatearPesos(r.gastosImputadosAPedidos)} están imputados a pedidos puntuales y
          se descuentan del margen de cada uno. El resto pesa sobre el resultado general.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Por pedido">
        {porPedido.length === 0 ? (
          <Vacio>No hay pedidos entregados en el período.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th>Comercio</Th>
                <Th alinear="right">Venta</Th>
                <Th alinear="right">Costo</Th>
                <Th alinear="right">Gastos</Th>
                <Th alinear="right">Margen</Th>
              </tr>
            </thead>
            <tbody>
              {porPedido.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/comercial/pedidos/${p.id}`} className="font-medium text-azul-700">
                      #{p.numero}
                    </Link>
                    <span className="ml-2 text-xs text-suave">{formatearFecha(p.fecha)}</span>
                  </Td>
                  <Td>{p.comercio}</Td>
                  <Td alinear="right">
                    <Plata centavos={p.ingresosCentavos} />
                  </Td>
                  <Td alinear="right">
                    <Plata centavos={p.costoCentavos} />
                  </Td>
                  <Td alinear="right">
                    <Plata centavos={p.gastosCentavos} />
                  </Td>
                  <Td alinear="right" className="font-medium">
                    <Plata centavos={p.margenCentavos} tono />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Por producto">
          {porProducto.length === 0 ? (
            <Vacio>Sin ventas en el período.</Vacio>
          ) : (
            <Tabla>
              <thead>
                <tr>
                  <Th>Producto</Th>
                  <Th alinear="right">Unid.</Th>
                  <Th alinear="right">Venta</Th>
                  <Th alinear="right">Margen</Th>
                </tr>
              </thead>
              <tbody>
                {porProducto.map((p) => (
                  <tr key={p.productoId}>
                    <Td>{p.nombre}</Td>
                    <Td alinear="right">{p.unidades}</Td>
                    <Td alinear="right">
                      <Plata centavos={p.ingresosCentavos} />
                    </Td>
                    <Td alinear="right">
                      <Plata centavos={p.ingresosCentavos - p.costoCentavos} tono />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          )}
        </Tarjeta>

        <Tarjeta titulo="Por comercio">
          {porCliente.length === 0 ? (
            <Vacio>Sin ventas en el período.</Vacio>
          ) : (
            <Tabla>
              <thead>
                <tr>
                  <Th>Comercio</Th>
                  <Th alinear="right">Pedidos</Th>
                  <Th alinear="right">Venta</Th>
                  <Th alinear="right">Margen</Th>
                </tr>
              </thead>
              <tbody>
                {porCliente.map((c) => (
                  <tr key={c.clienteId}>
                    <Td>
                      <Link href={`/comercial/clientes/${c.clienteId}`} className="text-azul-700">
                        {c.comercio}
                      </Link>
                    </Td>
                    <Td alinear="right">{c.pedidos}</Td>
                    <Td alinear="right">
                      <Plata centavos={c.ingresosCentavos} />
                    </Td>
                    <Td alinear="right">
                      <Plata centavos={c.ingresosCentavos - c.costoCentavos} tono />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          )}
        </Tarjeta>
      </div>

      <Tarjeta titulo="Cómo se vende">
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
          <Kpi
            etiqueta="Ticket promedio"
            valor={formatearPesos(kpis.ticketPromedioCentavos)}
            detalle={`${r.pedidosEntregados} pedidos entregados`}
          />
          <Kpi
            etiqueta="Unidades por pedido"
            valor={r.pedidosEntregados > 0 ? kpis.unidadesPorPedido.toFixed(1) : "—"}
            detalle={`${r.unidades} unidades en total`}
          />
          <Kpi
            etiqueta="Margen por unidad"
            valor={formatearPesos(kpis.margenPorUnidadCentavos)}
            tono="bueno"
            detalle="Venta menos costo"
          />
          <Kpi
            etiqueta="Neto por unidad"
            valor={formatearPesos(kpis.netoPorUnidadCentavos)}
            tono={kpis.netoPorUnidadCentavos >= 0 ? "bueno" : "malo"}
            detalle="Después de todos los gastos"
          />
        </div>
      </Tarjeta>

      {sinRotacion.length > 0 && (
        <Tarjeta titulo="No se movieron en el período">
          <p className="mb-3 text-sm text-suave">
            Mercadería que ocupa plata y no rotó. Es capital quieto.
          </p>
          <ul className="space-y-2">
            {sinRotacion.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-borde px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.nombre}</p>
                  <p className="text-xs text-suave">{p.stock} unidades en depósito</p>
                </div>
                <Plata centavos={p.capitalQuietoCentavos} />
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <Tarjeta titulo="Impuestos estimados">
        <Aviso
          tipo="ok"
          texto="Esto es una herramienta de gestión para saber cuánto apartar, no una liquidación fiscal. No contempla saldos a favor de períodos anteriores ni retenciones sufridas."
        />

        {!impuestos.aplica ? (
          <p className="mt-3 text-sm text-suave">
            El régimen configurado es {NOMBRE_REGIMEN[impuestos.regimen]}: se paga una cuota fija y no se liquida
            IVA, así que el estimador no aplica.
          </p>
        ) : (
          <dl className="mt-3 space-y-1.5 text-sm">
            <FilaImp etiqueta="Venta neta (sin IVA)" centavos={impuestos.ventaNetaCentavos} />
            <FilaImp etiqueta="IVA débito (lo que cobraste)" centavos={impuestos.ivaDebitoCentavos} />
            <FilaImp etiqueta="IVA crédito (compras)" centavos={-impuestos.ivaCreditoCentavos} />
            <FilaImp etiqueta="Percepciones sufridas" centavos={-impuestos.percepcionesCentavos} />
            <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-1.5">
              <dt className="font-medium">Saldo de IVA estimado</dt>
              <dd className="tabular font-semibold">{formatearPesos(impuestos.saldoIvaCentavos)}</dd>
            </div>
            {impuestos.alicuotaIIBB > 0 && (
              <FilaImp
                etiqueta={`Ingresos Brutos (${enPorcentaje(impuestos.alicuotaIIBB)}%)`}
                centavos={impuestos.iibbCentavos}
              />
            )}
            <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-1.5">
              <dt className="font-medium">Conviene tener apartado</dt>
              <dd className="tabular text-base font-semibold">
                {formatearPesos(impuestos.reservaSugeridaCentavos)}
              </dd>
            </div>
          </dl>
        )}

        <form action={accionGuardarImpuestos} className="mt-4 grid gap-3 border-t border-borde pt-4 sm:grid-cols-2">
          <CampoSelect
            etiqueta="Los precios de venta"
            name="preciosConIva"
            defaultValue={ajustes.conIva ? "1" : "0"}
          >
            <option value="1">Ya tienen el IVA adentro</option>
            <option value="0">Van sin IVA (se suma aparte)</option>
          </CampoSelect>
          <Campo
            etiqueta="Alícuota de IVA de ventas (%)"
            name="alicuotaVentas"
            inputMode="decimal"
            defaultValue={enPorcentaje(ajustes.alicuotaVentas)}
          />
          <Campo
            etiqueta="Alícuota de Ingresos Brutos (%)"
            name="alicuotaIIBB"
            inputMode="decimal"
            defaultValue={enPorcentaje(impuestos.alicuotaIIBB)}
            ayuda="0 = no calcularlo"
          />
          <Campo
            etiqueta="Días de stock a cubrir"
            name="diasDeCobertura"
            inputMode="numeric"
            defaultValue={String(ajustes.diasDeCobertura)}
            ayuda="Para la sugerencia de compra del depósito"
          />
          <div className="sm:col-span-2">
            <Boton type="submit" variante="secundario">
              Guardar ajustes
            </Boton>
          </div>
        </form>
      </Tarjeta>

      <Tarjeta titulo="Gastos por categoría">
        {categorias.length === 0 ? (
          <Vacio>Sin gastos en el período.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Categoría</Th>
                <Th>Tipo</Th>
                <Th alinear="right">Total</Th>
                <Th alinear="right">% del gasto</Th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.categoria}>
                  <Td>{c.categoria}</Td>
                  <Td className="capitalize">{c.tipo}</Td>
                  <Td alinear="right">
                    <Plata centavos={c.total} />
                  </Td>
                  <Td alinear="right">
                    {r.gastosCentavos > 0 ? `${((c.total / r.gastosCentavos) * 100).toFixed(1)}%` : "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>
    </div>
  );
}

function Fila({ etiqueta, centavos }: { etiqueta: string; centavos: number }) {
  return (
    <div className="flex justify-between text-suave">
      <dt>{etiqueta}</dt>
      <dd>
        <Plata centavos={centavos} />
      </dd>
    </div>
  );
}

function FilaImp({ etiqueta, centavos }: { etiqueta: string; centavos: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-suave">{etiqueta}</dt>
      <dd className="tabular">{formatearPesos(centavos)}</dd>
    </div>
  );
}
