import { Aviso, Estado, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha } from "@/lib/formato";
import { requerirCliente } from "@/lib/auth";
import { listarPedidos } from "@/lib/datos/pedidos";

export const dynamic = "force-dynamic";

export default async function Entregas({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const sesion = await requerirCliente();
  const pedidos = await listarPedidos({ clienteId: sesion.clienteId });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Entregas</h1>
        <p className="text-sm text-suave">Todo lo que pediste y en qué estado está.</p>
      </div>

      {ok && <Aviso tipo="ok" texto="¡Listo! Recibimos tu pedido y ya lo estamos viendo." />}

      <Tarjeta>
        {pedidos.length === 0 ? (
          <Vacio>Todavía no hay pedidos.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th>Estado</Th>
                <Th alinear="right">Unidades</Th>
                <Th alinear="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <span className="font-medium">#{p.numero}</span>
                    <span className="block text-xs text-suave">
                      {formatearFecha(p.fecha)}
                      {p.creadoPor && ` · ${p.creadoPor}`}
                    </span>
                  </Td>
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
