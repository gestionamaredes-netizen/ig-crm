import Link from "next/link";
import { notFound } from "next/navigation";
import { Aviso, Boton, Campo, Estado, Plata, Tabla, Tarjeta, Td, Th } from "@/components/ui";
import { centavosAInput, formatearFecha, formatearPesos } from "@/lib/formato";
import { estadoPago, obtenerCompra, saldoCompra } from "@/lib/datos/compras";
import { NOMBRE_REGIMEN, type Regimen } from "@/lib/datos/config";
import {
  accionAnularCompra,
  accionConfirmarCompra,
  accionEliminarBorrador,
  accionPagarCompra,
} from "../../actions";

export const dynamic = "force-dynamic";

export default async function DetalleCompra({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const compra = await obtenerCompra(id);
  if (!compra) notFound();

  const saldo = saldoCompra(compra);
  const pago = estadoPago(compra);
  const unidades = compra.items.reduce((a, i) => a + i.cantidad, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/comercial/compras" className="toque text-xs font-medium text-azul-700">
          ← Compras
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight">Compra #{compra.numero}</h1>
          <Estado valor={compra.estado} />
          {compra.estado === "confirmada" && <Estado valor={pago} />}
        </div>
        <p className="text-sm text-suave">
          {compra.proveedor} · {formatearFecha(compra.fecha)}
          {compra.comprobante && ` · ${compra.comprobante}`}
        </p>
      </div>

      {error && <Aviso texto={error} />}

      {compra.estado === "borrador" && (
        <Aviso
          tipo="ok"
          texto="Todavía es un borrador: la mercadería no entró al depósito y el costo de los productos no cambió."
        />
      )}

      <Tarjeta titulo="Renglones">
        <Tabla>
          <thead>
            <tr>
              <Th>Producto</Th>
              <Th alinear="right">Cant.</Th>
              <Th alinear="right">Costo neto</Th>
              <Th alinear="right">IVA</Th>
              <Th alinear="right">Costo real</Th>
            </tr>
          </thead>
          <tbody>
            {compra.items.map((i) => (
              <tr key={i.id}>
                <Td>
                  <span className="font-medium">{i.nombre}</span>
                  {i.presentacion && <span className="block text-xs text-suave">{i.presentacion}</span>}
                </Td>
                <Td alinear="right" className="tabular">
                  {i.cantidad}
                </Td>
                <Td alinear="right">
                  <Plata centavos={i.costoUnitNetoCentavos} />
                </Td>
                <Td alinear="right" className="tabular text-suave">
                  {(i.ivaAlicuota / 100).toString().replace(".", ",")}%
                </Td>
                <Td alinear="right">
                  <strong>
                    <Plata centavos={i.costoRealUnitCentavos} />
                  </strong>
                  {i.prorrateoCentavos !== 0 && (
                    <span className="block text-xs text-suave">
                      incluye {formatearPesos(i.prorrateoCentavos)} prorrateados
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Tabla>
        <p className="mt-3 text-xs text-suave">
          El costo real es lo que cuesta cada unidad puesta en el depósito: neto, más la parte que le toca de
          percepciones y fletes, más el IVA si el régimen no lo deja computar.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Totales">
        <dl className="space-y-1.5 text-sm">
          <Fila etiqueta="Neto" centavos={compra.netoCentavos} />
          <Fila etiqueta="IVA" centavos={compra.ivaCentavos} />
          {compra.percepcionesCentavos !== 0 && (
            <Fila etiqueta="Percepciones" centavos={compra.percepcionesCentavos} />
          )}
          {compra.otrosCentavos !== 0 && <Fila etiqueta="Otros costos" centavos={compra.otrosCentavos} />}
          <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-1.5">
            <dt className="font-medium">Total</dt>
            <dd className="tabular text-base font-semibold">{formatearPesos(compra.totalCentavos)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-suave">
          {unidades} unidades · Forma de pago: {compra.formaPago}
          {compra.regimenAlConfirmar &&
            ` · Confirmada como ${NOMBRE_REGIMEN[compra.regimenAlConfirmar as Regimen] ?? compra.regimenAlConfirmar}`}
        </p>
      </Tarjeta>

      {compra.estado === "borrador" && (
        <Tarjeta titulo="Confirmar">
          <p className="mb-3 text-sm text-suave">
            Al confirmar entran {unidades} unidades al depósito con su movimiento, y el costo promedio de cada
            producto se recalcula con lo que pagaste.
          </p>
          <div className="flex flex-wrap gap-2">
            <form action={accionConfirmarCompra}>
              <input type="hidden" name="id" value={compra.id} />
              <Boton type="submit">Confirmar compra</Boton>
            </form>
            <form action={accionEliminarBorrador}>
              <input type="hidden" name="id" value={compra.id} />
              <Boton type="submit" variante="peligro">
                Descartar borrador
              </Boton>
            </form>
          </div>
        </Tarjeta>
      )}

      {compra.estado === "confirmada" && (
        <>
          <Tarjeta titulo="Pagos">
            <dl className="mb-3 space-y-1.5 text-sm">
              <Fila etiqueta="Pagado" centavos={compra.pagadoCentavos} />
              <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-1.5">
                <dt className="font-medium">Saldo</dt>
                <dd className="tabular text-base font-semibold">{formatearPesos(saldo)}</dd>
              </div>
            </dl>
            {saldo > 0 ? (
              <form action={accionPagarCompra} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={compra.id} />
                <Campo
                  etiqueta="Registrar pago"
                  name="monto"
                  inputMode="decimal"
                  defaultValue={centavosAInput(saldo)}
                  required
                />
                <Boton type="submit">Registrar</Boton>
              </form>
            ) : (
              <p className="text-sm text-suave">Está paga.</p>
            )}
          </Tarjeta>

          <Tarjeta titulo="Anular">
            <p className="mb-3 text-sm text-suave">
              Anular devuelve las unidades al lugar de donde salieron y deshace el promedio de costo. La compra
              queda en el historial: no se borra.
            </p>
            <form action={accionAnularCompra} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={compra.id} />
              <Campo etiqueta="Motivo" name="motivo" placeholder="Cargada dos veces" required />
              <Boton type="submit" variante="peligro">
                Anular compra
              </Boton>
            </form>
          </Tarjeta>
        </>
      )}

      {compra.notas && (
        <Tarjeta titulo="Notas">
          <p className="whitespace-pre-line text-sm text-suave">{compra.notas}</p>
        </Tarjeta>
      )}
    </div>
  );
}

function Fila({ etiqueta, centavos }: { etiqueta: string; centavos: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-suave">{etiqueta}</dt>
      <dd className="tabular">{formatearPesos(centavos)}</dd>
    </div>
  );
}
