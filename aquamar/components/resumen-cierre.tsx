import Image from "next/image";
import { formatearFecha, formatearPesos, textoBultos } from "@/lib/formato";
import type { ResumenCierre } from "@/lib/datos/cierre";

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-borde py-1.5 last:border-0">
      <dt className="text-suave">{etiqueta}</dt>
      <dd className="tabular font-medium">{valor}</dd>
    </div>
  );
}

/**
 * El comprobante del cierre. Es la misma pantalla antes y después de cerrar:
 * primero como vista previa de lo que se va a archivar, después como el
 * documento guardado.
 *
 * Está pensado para imprimirse —o guardarse como PDF desde el navegador, que es
 * lo mismo en un celular—. Por eso los bloques no se cortan al medio y los
 * botones desaparecen al imprimir.
 */
export function ResumenCierreImpreso({
  resumen,
  periodo,
  hechoPor,
  nota,
  cuando,
}: {
  resumen: ResumenCierre;
  periodo: string;
  hechoPor?: string;
  nota?: string;
  cuando?: string;
}) {
  const margen = resumen.pedidos.facturadoCentavos - resumen.compras.totalCentavos - resumen.gastosCentavos;

  return (
    <article className="rounded-2xl border border-borde bg-white p-5 shadow-sm print:border-0 print:p-0 print:shadow-none">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-azul-600 pb-3">
        <div className="flex items-center gap-3">
          <Image src="/marca/logotipo.png" alt="Aqua Mar" width={120} height={27} className="h-6 w-auto" />
          <span className="text-xs text-suave">Distribuidora Aqua Mar</span>
        </div>
        <span className="text-xs text-suave">
          {cuando ? `Cerrado el ${formatearFecha(cuando.slice(0, 10))}` : "Vista previa del cierre"}
        </span>
      </header>

      <h2 className="mt-4 text-xl font-semibold tracking-tight text-azul-700">Cierre de período</h2>
      <p className="text-sm text-suave">
        <strong className="text-tinta">{periodo}</strong> · del {formatearFecha(resumen.desde)} al{" "}
        {formatearFecha(resumen.hasta)}
        {hechoPor && ` · lo cerró ${hechoPor}`}
      </p>
      {nota && <p className="mt-2 rounded-xl bg-azul-50 p-3 text-sm text-azul-900 print:bg-transparent">{nota}</p>}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 print:grid-cols-2">
        <section className="break-inside-avoid">
          <h3 className="text-sm font-semibold text-azul-700">Ventas</h3>
          <dl className="mt-1 text-sm">
            <Fila etiqueta="Pedidos cargados" valor={String(resumen.pedidos.total)} />
            <Fila etiqueta="Entregados" valor={String(resumen.pedidos.entregados)} />
            <Fila etiqueta="Unidades entregadas" valor={String(resumen.pedidos.unidades)} />
            <Fila etiqueta="Facturado" valor={formatearPesos(resumen.pedidos.facturadoCentavos)} />
            <Fila etiqueta="Cobrado" valor={formatearPesos(resumen.pedidos.cobradoCentavos)} />
          </dl>
        </section>

        <section className="break-inside-avoid">
          <h3 className="text-sm font-semibold text-azul-700">Compras y gastos</h3>
          <dl className="mt-1 text-sm">
            <Fila etiqueta="Compras confirmadas" valor={String(resumen.compras.confirmadas)} />
            <Fila etiqueta="Total comprado" valor={formatearPesos(resumen.compras.totalCentavos)} />
            <Fila etiqueta="Pagado a proveedores" valor={formatearPesos(resumen.compras.pagadoCentavos)} />
            <Fila etiqueta="Gastos" valor={formatearPesos(resumen.gastosCentavos)} />
            <Fila etiqueta="Margen bruto del período" valor={formatearPesos(margen)} />
          </dl>
        </section>

        <section className="break-inside-avoid">
          <h3 className="text-sm font-semibold text-azul-700">Caja al cerrar</h3>
          <dl className="mt-1 text-sm">
            <Fila etiqueta="Entró" valor={formatearPesos(resumen.caja.ingresosCentavos)} />
            <Fila etiqueta="Salió" valor={formatearPesos(resumen.caja.egresosCentavos)} />
            <Fila etiqueta="Saldo en efectivo" valor={formatearPesos(resumen.caja.efectivoCentavos)} />
            <Fila etiqueta="Saldo en banco" valor={formatearPesos(resumen.caja.bancoCentavos)} />
          </dl>
        </section>

        <section className="break-inside-avoid">
          <h3 className="text-sm font-semibold text-azul-700">Lo que queda pendiente</h3>
          <dl className="mt-1 text-sm">
            <Fila etiqueta="Comercios activos" valor={String(resumen.comercios)} />
            <Fila etiqueta="Comercios que deben" valor={String(resumen.deudas.comercios)} />
            <Fila etiqueta="Total a cobrar" valor={formatearPesos(resumen.deudas.totalCentavos)} />
          </dl>
          <p className="mt-2 text-xs text-suave">
            Estos saldos no pasan al mes nuevo: quedan asentados acá y se reclaman con este comprobante.
          </p>
        </section>
      </div>

      <section className="mt-5 break-inside-avoid">
        <h3 className="text-sm font-semibold text-azul-700">Movimiento por producto</h3>
        <div className="-mx-1 mt-1 overflow-x-auto px-1">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-borde text-left text-xs text-suave">
                <th className="pb-1.5 font-medium">Producto</th>
                <th className="pb-1.5 text-right font-medium">Entradas</th>
                <th className="pb-1.5 text-right font-medium">Salidas</th>
                <th className="pb-1.5 text-right font-medium">Ajustes</th>
                <th className="pb-1.5 text-right font-medium">Quedó</th>
                <th className="pb-1.5 text-right font-medium">Costo</th>
                <th className="pb-1.5 text-right font-medium">Precio</th>
              </tr>
            </thead>
            <tbody>
              {resumen.productos.map((p) => (
                <tr key={p.nombre} className="border-b border-borde last:border-0">
                  <td className="py-1.5">
                    {p.nombre}
                    {p.presentacion && <span className="block text-xs text-suave">{p.presentacion}</span>}
                  </td>
                  <td className="py-1.5 text-right tabular">{p.entradas}</td>
                  <td className="py-1.5 text-right tabular">{p.salidas}</td>
                  <td className="py-1.5 text-right tabular">{p.ajustes || "—"}</td>
                  <td className="py-1.5 text-right tabular font-medium">
                    {p.stockFinal}
                    {p.unidadesPorBulto > 1 && p.stockFinal >= p.unidadesPorBulto && (
                      <span className="block text-xs font-normal text-suave">
                        {textoBultos(p.stockFinal, p.unidadesPorBulto)}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 text-right tabular">{formatearPesos(p.costoCentavos)}</td>
                  <td className="py-1.5 text-right tabular">{formatearPesos(p.precioCentavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {resumen.comisiones.length > 0 && (
        <section className="mt-5 break-inside-avoid">
          <h3 className="text-sm font-semibold text-azul-700">Comisiones</h3>
          <table className="mt-1 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-borde text-left text-xs text-suave">
                <th className="pb-1.5 font-medium">Vendedor</th>
                <th className="pb-1.5 text-right font-medium">Ganó</th>
                <th className="pb-1.5 text-right font-medium">Se le pagó</th>
                <th className="pb-1.5 text-right font-medium">Queda debiendo</th>
              </tr>
            </thead>
            <tbody>
              {resumen.comisiones.map((c) => (
                <tr key={c.vendedor} className="border-b border-borde last:border-0">
                  <td className="py-1.5">{c.vendedor}</td>
                  <td className="py-1.5 text-right tabular">{formatearPesos(c.ganadoCentavos)}</td>
                  <td className="py-1.5 text-right tabular">{formatearPesos(c.pagadoCentavos)}</td>
                  <td className="py-1.5 text-right tabular font-medium">{formatearPesos(c.saldoCentavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="mt-5 border-t border-borde pt-3 text-xs text-suave">
        Comprobante de cierre de Aqua Mar Distribuidora. Al cerrar, el sistema queda sin historial y con el stock,
        los costos y los precios en cero; las fichas de comercios, productos y vendedores se conservan. Lo que este
        papel dice es lo que había un segundo antes de vaciarlo.
      </p>
    </article>
  );
}
