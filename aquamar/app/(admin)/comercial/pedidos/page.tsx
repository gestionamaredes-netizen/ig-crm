import Link from "next/link";
import { BotonLink, Estado, Kpi, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { BotonBorrar } from "@/components/boton-borrar";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import { accionEliminarPedido } from "../actions";
import { cuentasPorCobrar, listarPedidos } from "@/lib/datos/pedidos";
import { listarVendedores } from "@/lib/datos/vendedores";
import { PuntoVendedor } from "@/components/chip-vendedor";
import { ESTADOS_PEDIDO, type EstadoPedido } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function Pedidos({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; ver?: string }>;
}) {
  const { estado, ver } = await searchParams;
  // "Falta cobrar" no es un estado de entrega: es una pregunta sobre la plata,
  // y por eso va en su propio parámetro y no mezclado con los estados.
  const faltaCobrar = ver === "falta-cobrar";
  const filtro = ESTADOS_PEDIDO.includes(estado as EstadoPedido) ? (estado as EstadoPedido) : undefined;
  const pedidos = faltaCobrar ? [] : await listarPedidos(filtro ? { estado: filtro } : {});
  const conSaldo = faltaCobrar ? await cuentasPorCobrar("todos") : [];
  const totalPendiente = conSaldo.reduce((a, p) => a + p.saldoCentavos, 0);
  const pendienteEntregado = conSaldo
    .filter((p) => p.estado === "entregado")
    .reduce((a, p) => a + p.saldoCentavos, 0);
  const vendedores = new Map((await listarVendedores()).map((v) => [v.id, v]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-suave">
            El stock se descuenta cuando el pedido pasa a entregado. Uno cargado mal se borra desde acá.
          </p>
        </div>
        <BotonLink href="/comercial/pedidos/nuevo">Nuevo pedido</BotonLink>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
        <div className="flex min-w-max gap-2">
          <FiltroEstado activo={!filtro && !faltaCobrar} href="/comercial/pedidos" texto="Todos" />
          {ESTADOS_PEDIDO.map((e) => (
            <FiltroEstado
              key={e}
              activo={!faltaCobrar && filtro === e}
              href={`/comercial/pedidos?estado=${e}`}
              texto={e}
            />
          ))}
          <FiltroEstado
            activo={faltaCobrar}
            href="/comercial/pedidos?ver=falta-cobrar"
            texto="Falta cobrar"
            capitalizar={false}
          />
        </div>
      </div>

      {faltaCobrar ? (
        <>
          {/*
            * El total va en su propio renglón, a todo el ancho: con el cuerpo
            * grande del destacado, en media columna un importe de siete
            * cifras se sale de la tarjeta en un celular.
            */}
          <div className="space-y-3">
            <Kpi
              etiqueta="Falta cobrar"
              valor={formatearPesos(totalPendiente)}
              tono={totalPendiente > 0 ? "malo" : "neutro"}
              detalle={`${conSaldo.length} ${conSaldo.length === 1 ? "pedido" : "pedidos"} con saldo`}
              destacado
            />
            <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
              <Kpi
                etiqueta="Ya entregado y sin cobrar"
                valor={formatearPesos(pendienteEntregado)}
                detalle="La mercadería salió: es deuda"
              />
              <Kpi
                etiqueta="Todavía sin entregar"
                valor={formatearPesos(totalPendiente - pendienteEntregado)}
                detalle="Plata a cobrar, pero nadie recibió nada aún"
              />
            </div>
          </div>

          <Tarjeta>
            {conSaldo.length === 0 ? (
              <Vacio>No queda nada por cobrar. Está todo al día.</Vacio>
            ) : (
              <Tabla>
                <thead>
                  <tr>
                    <Th>Pedido</Th>
                    <Th>Comercio</Th>
                    <Th>Entrega</Th>
                    <Th alinear="right">Total</Th>
                    <Th alinear="right">Cobrado</Th>
                    <Th alinear="right">Saldo</Th>
                  </tr>
                </thead>
                <tbody>
                  {conSaldo.map((p) => (
                    <tr key={p.pedidoId}>
                      <Td>
                        <Link href={`/comercial/pedidos/${p.pedidoId}`} className="font-medium text-azul-700">
                          #{p.numero}
                        </Link>
                        <span className="ml-2 text-xs text-suave">{formatearFecha(p.fecha)}</span>
                      </Td>
                      <Td>{p.comercio}</Td>
                      <Td>
                        <Estado valor={p.estado} />
                      </Td>
                      <Td alinear="right">
                        <Plata centavos={p.totalCentavos} />
                      </Td>
                      <Td alinear="right" className="text-suave">
                        <Plata centavos={p.cobradoCentavos} />
                      </Td>
                      <Td alinear="right">
                        <strong>
                          <Plata centavos={p.saldoCentavos} />
                        </strong>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            )}
            <p className="mt-3 text-xs text-suave">
              Sin cobrar y cobrados a medias, estén entregados o no. Los cancelados quedan afuera. Esta lista no
              mira el período: una deuda de hace tres meses sigue siendo una deuda hoy.
            </p>
          </Tarjeta>
        </>
      ) : (
      <Tarjeta>
        {pedidos.length === 0 ? (
          <Vacio>No hay pedidos con ese filtro.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th>Comercio</Th>
                <Th>Estado</Th>
                <Th alinear="right">Unidades</Th>
                <Th alinear="right">Total</Th>
                <Th alinear="right">Borrar</Th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/comercial/pedidos/${p.id}`} className="font-medium text-azul-700">
                      #{p.numero}
                    </Link>
                    <span className="ml-2 text-xs text-suave">{formatearFecha(p.fecha)}</span>
                    {p.origen !== "admin" && (
                      <span className="ml-2 rounded-full bg-azul-50 px-2 py-0.5 text-xs text-azul-700">
                        desde el panel
                      </span>
                    )}
                  </Td>
                  <Td>
                    {(() => {
                      const v = p.vendedorId ? vendedores.get(p.vendedorId) : undefined;
                      return v ? (
                        <span className="inline-flex items-center gap-2">
                          <PuntoVendedor nombre={v.nombre} color={v.color} />
                          {p.comercio}
                        </span>
                      ) : (
                        p.comercio
                      );
                    })()}
                  </Td>
                  <Td>
                    <Estado valor={p.estado} />
                  </Td>
                  <Td alinear="right">{p.unidades}</Td>
                  <Td alinear="right">
                    <Plata centavos={p.totalCentavos} />
                  </Td>
                  <Td alinear="right">
                    <form action={accionEliminarPedido}>
                      <input type="hidden" name="id" value={p.id} />
                      <BotonBorrar pregunta={avisoDeBorrado(p)}>Borrar</BotonBorrar>
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>
      )}
    </div>
  );
}

/**
 * Lo que se pierde al borrar, dicho antes de borrarlo. Un pedido que ya se
 * entregó o que ya cobró algo no se lleva solo su renglón: mueve el depósito y
 * la caja, y eso hay que verlo antes de decir que sí.
 */
function avisoDeBorrado(p: { numero: number; comercio: string; unidades: number; cobradoCentavos: number }): string {
  const partes = [`Se borra el pedido #${p.numero} de ${p.comercio}.`];
  if (p.unidades > 0) partes.push(`Si estaba entregado, vuelven ${p.unidades} unidades al depósito.`);
  if (p.cobradoCentavos > 0) partes.push(`Salen ${formatearPesos(p.cobradoCentavos)} de la caja.`);
  partes.push("No se puede deshacer.");
  return partes.join(" ");
}

function FiltroEstado({
  href,
  texto,
  activo,
  capitalizar = true,
}: {
  href: string;
  texto: string;
  activo: boolean;
  /** Los estados vienen en minúscula del esquema; un rótulo propio, no. */
  capitalizar?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-medium transition ${capitalizar ? "capitalize" : ""} ${
        activo ? "bg-azul-600 text-white" : "border border-borde bg-white text-suave hover:bg-azul-50"
      }`}
    >
      {texto}
    </Link>
  );
}
