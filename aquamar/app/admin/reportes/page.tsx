import Link from "next/link";
import { Boton, Campo, Kpi, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, formatearPesos, hoy, inicioDeMes } from "@/lib/formato";
import {
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

  const r = resumen(rango);
  const porPedido = rentabilidadPorPedido(rango);
  const porProducto = rentabilidadPorProducto(rango);
  const porCliente = rentabilidadPorCliente(rango);
  const categorias = gastosPorCategoria(rango);

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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                    <Link href={`/admin/pedidos/${p.id}`} className="font-medium text-marea-700">
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
                      <Link href={`/admin/clientes/${c.clienteId}`} className="text-marea-700">
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
