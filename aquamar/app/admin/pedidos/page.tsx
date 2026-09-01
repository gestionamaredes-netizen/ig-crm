import Link from "next/link";
import { BotonLink, Estado, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha } from "@/lib/formato";
import { listarPedidos } from "@/lib/datos/pedidos";
import { ESTADOS_PEDIDO, type EstadoPedido } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function Pedidos({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const filtro = ESTADOS_PEDIDO.includes(estado as EstadoPedido) ? (estado as EstadoPedido) : undefined;
  const pedidos = listarPedidos(filtro ? { estado: filtro } : {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-suave">El stock se descuenta cuando el pedido pasa a entregado.</p>
        </div>
        <BotonLink href="/admin/pedidos/nuevo">Nuevo pedido</BotonLink>
      </div>

      <div className="-mx-5 overflow-x-auto px-5">
        <div className="flex min-w-max gap-2">
          <FiltroEstado activo={!filtro} href="/admin/pedidos" texto="Todos" />
          {ESTADOS_PEDIDO.map((e) => (
            <FiltroEstado key={e} activo={filtro === e} href={`/admin/pedidos?estado=${e}`} texto={e} />
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
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/admin/pedidos/${p.id}`} className="font-medium text-marea-700">
                      #{p.numero}
                    </Link>
                    <span className="ml-2 text-xs text-suave">{formatearFecha(p.fecha)}</span>
                    {p.origen !== "admin" && (
                      <span className="ml-2 rounded-full bg-marea-50 px-2 py-0.5 text-[11px] text-marea-700">
                        desde el panel
                      </span>
                    )}
                  </Td>
                  <Td>{p.comercio}</Td>
                  <Td>
                    <Estado valor={p.estado} />
                  </Td>
                  <Td alinear="right">{p.unidades}</Td>
                  <Td alinear="right">
                    <Plata centavos={p.totalCentavos} />
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

function FiltroEstado({ href, texto, activo }: { href: string; texto: string; activo: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-1.5 text-sm font-medium capitalize transition ${
        activo ? "bg-marea-600 text-white" : "border border-borde bg-white text-suave hover:bg-marea-50"
      }`}
    >
      {texto}
    </Link>
  );
}
