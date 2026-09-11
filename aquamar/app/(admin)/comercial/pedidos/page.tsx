import Link from "next/link";
import { BotonLink, Estado, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { BotonBorrar } from "@/components/boton-borrar";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import { accionEliminarPedido } from "../actions";
import { listarPedidos } from "@/lib/datos/pedidos";
import { listarVendedores } from "@/lib/datos/vendedores";
import { PuntoVendedor } from "@/components/chip-vendedor";
import { ESTADOS_PEDIDO, type EstadoPedido } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function Pedidos({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const filtro = ESTADOS_PEDIDO.includes(estado as EstadoPedido) ? (estado as EstadoPedido) : undefined;
  const pedidos = await listarPedidos(filtro ? { estado: filtro } : {});
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
          <FiltroEstado activo={!filtro} href="/comercial/pedidos" texto="Todos" />
          {ESTADOS_PEDIDO.map((e) => (
            <FiltroEstado key={e} activo={filtro === e} href={`/comercial/pedidos?estado=${e}`} texto={e} />
          ))}
        </div>
      </div>

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

function FiltroEstado({ href, texto, activo }: { href: string; texto: string; activo: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${
        activo ? "bg-azul-600 text-white" : "border border-borde bg-white text-suave hover:bg-azul-50"
      }`}
    >
      {texto}
    </Link>
  );
}
