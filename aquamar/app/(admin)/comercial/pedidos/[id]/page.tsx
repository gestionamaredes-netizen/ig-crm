import Link from "next/link";
import { notFound } from "next/navigation";
import { Aviso, Boton, Campo, CampoSelect, Estado, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { centavosAInput, formatearFecha, formatearPesos, hoy } from "@/lib/formato";
import { estadoCobro, obtenerPedido, saldoPedido } from "@/lib/datos/pedidos";
import { listarCategorias, listarGastos } from "@/lib/datos/gastos";
import { ESTADOS_PEDIDO, FORMAS_PAGO } from "@/lib/db/schema";
import {
  accionCambiarEstadoPedido,
  accionCobrarPedido,
  accionEliminarGasto,
  accionEliminarPedido,
  accionFormaPagoPedido,
  accionGastoDePedido,
} from "../../actions";

export const dynamic = "force-dynamic";

export default async function DetallePedido({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const pedido = await obtenerPedido(id);
  if (!pedido) notFound();

  const gastos = await listarGastos({ pedidoId: id });
  const categorias = await listarCategorias(true);

  const total = pedido.items.reduce((acc, i) => acc + i.cantidad * i.precioUnitCentavos, 0);
  const costo = pedido.items.reduce((acc, i) => acc + i.cantidad * i.costoUnitCentavos, 0);
  const gastoAsignado = gastos.reduce((acc, g) => acc + g.montoCentavos, 0);
  const margen = total - costo - gastoAsignado;
  const cobro = { cobradoCentavos: pedido.cobradoCentavos, totalCentavos: total };
  const saldo = saldoPedido(cobro);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/comercial/pedidos" className="toque text-xs font-medium text-azul-700">
            ← Pedidos
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Pedido #{pedido.numero}</h1>
          <p className="text-sm text-suave">
            <Link href={`/comercial/clientes/${pedido.clienteId}`} className="toque text-azul-700">
              {pedido.comercio}
            </Link>{" "}
            · {formatearFecha(pedido.fecha)}
            {pedido.origen !== "admin" && ` · cargado por ${pedido.creadoPor || "el comercio"}`}
          </p>
        </div>
        <Estado valor={pedido.estado} />
      </div>

      {error && <Aviso texto={error} />}

      <Tarjeta titulo="Estado">
        <div className="flex flex-wrap gap-2">
          {ESTADOS_PEDIDO.map((e) => (
            <form action={accionCambiarEstadoPedido} key={e}>
              <input type="hidden" name="id" value={pedido.id} />
              <input type="hidden" name="estado" value={e} />
              <Boton type="submit" variante={pedido.estado === e ? "primario" : "secundario"} className="capitalize">
                {e}
              </Boton>
            </form>
          ))}
        </div>
        <p className="mt-3 text-xs text-suave">
          Al marcarlo entregado se descuentan las unidades del inventario y pasan al stock del comercio. Si lo volvés
          atrás, las unidades se reintegran.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Detalle">
        <Tabla>
          <thead>
            <tr>
              <Th>Producto</Th>
              <Th alinear="right">Cant.</Th>
              <Th alinear="right">Precio</Th>
              <Th alinear="right">Subtotal</Th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((i) => (
              <tr key={i.id}>
                <Td>
                  {i.nombre}
                  {i.presentacion && <span className="block text-xs text-suave">{i.presentacion}</span>}
                </Td>
                <Td alinear="right">{i.cantidad}</Td>
                <Td alinear="right">{formatearPesos(i.precioUnitCentavos)}</Td>
                <Td alinear="right">
                  <Plata centavos={i.cantidad * i.precioUnitCentavos} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Tabla>

        <dl className="mt-4 space-y-1 text-sm">
          <Fila etiqueta="Total del pedido" centavos={total} />
          <Fila etiqueta="Costo de mercadería" centavos={-costo} />
          <Fila etiqueta="Gastos imputados" centavos={-gastoAsignado} />
          <div className="flex justify-between border-t border-borde pt-2 font-semibold">
            <dt>Margen del pedido</dt>
            <dd>
              <Plata centavos={margen} tono />
            </dd>
          </div>
        </dl>

        {pedido.notas && <p className="mt-4 rounded-xl bg-azul-50 p-3 text-sm text-azul-900">{pedido.notas}</p>}
      </Tarjeta>

      <Tarjeta
        titulo="Cobranza"
        accion={<Estado valor={estadoCobro(cobro)} />}
      >
        <dl className="mb-3 space-y-1.5 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-suave">Total del pedido</dt>
            <dd className="tabular">{formatearPesos(total)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-suave">Cobrado</dt>
            <dd className="tabular">{formatearPesos(pedido.cobradoCentavos)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-borde pt-1.5">
            <dt className="font-medium">Saldo</dt>
            <dd className="tabular text-base font-semibold">{formatearPesos(saldo)}</dd>
          </div>
        </dl>

        {saldo > 0 ? (
          <form action={accionCobrarPedido} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={pedido.id} />
            <Campo etiqueta="Cobrar" name="monto" inputMode="decimal" defaultValue={centavosAInput(saldo)} required />
            <CampoSelect etiqueta="Entra por" name="medio" defaultValue="efectivo">
              <option value="efectivo">Efectivo</option>
              <option value="banco">Banco</option>
            </CampoSelect>
            <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
            <div className="flex items-end">
              <Boton type="submit">Registrar cobro</Boton>
            </div>
          </form>
        ) : (
          <p className="text-sm text-suave">Está cobrado.</p>
        )}

        <form action={accionFormaPagoPedido} className="mt-4 flex flex-wrap items-end gap-3 border-t border-borde pt-4">
          <input type="hidden" name="id" value={pedido.id} />
          <CampoSelect etiqueta="Forma de pago acordada" name="formaPago" defaultValue={pedido.formaPago}>
            {FORMAS_PAGO.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </CampoSelect>
          <Boton type="submit" variante="secundario">
            Guardar
          </Boton>
        </form>
        <p className="mt-2 text-xs text-suave">
          Lo que cobrás entra a la caja en el mismo movimiento: no hay que anotarlo dos veces.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Gastos de este pedido">
        <p className="mb-3 text-sm text-suave">
          Flete, combustible, ayudante: lo que se gastó puntualmente en esta entrega y se descuenta de su margen.
        </p>

        {gastos.length === 0 ? (
          <Vacio>Sin gastos imputados.</Vacio>
        ) : (
          <ul className="mb-4 space-y-2">
            {gastos.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 rounded-xl border border-borde px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{g.categoria}</p>
                  <p className="text-xs text-suave">
                    {formatearFecha(g.fecha)}
                    {g.descripcion && ` · ${g.descripcion}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Plata centavos={g.montoCentavos} />
                  <form action={accionEliminarGasto}>
                    <input type="hidden" name="id" value={g.id} />
                    <button className="toque text-xs text-suave hover:text-rose-700">Borrar</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        {categorias.length === 0 ? (
          <p className="text-sm text-suave">
            Creá una categoría en <Link href="/comercial/gastos" className="text-azul-700">Gastos</Link> para imputar acá.
          </p>
        ) : (
          <form action={accionGastoDePedido} className="grid gap-3 sm:grid-cols-4">
            <input type="hidden" name="pedidoId" value={pedido.id} />
            <CampoSelect etiqueta="Se pagó con" name="medioPago" defaultValue="efectivo">
              <option value="efectivo">Efectivo</option>
              <option value="banco">Banco</option>
            </CampoSelect>
            <CampoSelect etiqueta="Categoría" name="categoriaId" required>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </CampoSelect>
            <Campo etiqueta="Monto" name="monto" inputMode="decimal" placeholder="0,00" required />
            <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={pedido.fecha || hoy()} />
            <div className="flex items-end">
              <Boton type="submit" className="w-full">
                Imputar
              </Boton>
            </div>
            <div className="sm:col-span-4">
              <Campo etiqueta="Detalle" name="descripcion" placeholder="Opcional" />
            </div>
          </form>
        )}
      </Tarjeta>

      <form action={accionEliminarPedido}>
        <input type="hidden" name="id" value={pedido.id} />
        <Boton type="submit" variante="peligro">
          Eliminar pedido
        </Boton>
      </form>
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
