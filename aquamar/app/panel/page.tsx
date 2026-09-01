import { BotonLink, Kpi, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearPesos } from "@/lib/formato";
import { requerirCliente } from "@/lib/auth";
import { stockDelCliente } from "@/lib/datos/panel";
import { listarPedidos } from "@/lib/datos/pedidos";
import { Estado, Plata } from "@/components/ui";
import { formatearFecha } from "@/lib/formato";

export const dynamic = "force-dynamic";

export default async function MiStock() {
  const sesion = await requerirCliente();
  const stock = await stockDelCliente(sesion.clienteId);
  const abiertos = (await listarPedidos({ clienteId: sesion.clienteId })).filter(
    (p) => p.estado === "pendiente" || p.estado === "preparando",
  );

  const disponible = stock.reduce((acc, l) => acc + l.disponible, 0);
  const vendido = stock.reduce((acc, l) => acc + l.vendido, 0);
  const valorEnGondola = stock.reduce((acc, l) => acc + l.disponible * l.precioCentavos, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold tracking-tight">Mi stock</h1>
        <BotonLink href="/panel/pedir">Hacer un pedido</BotonLink>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3">
        <Kpi etiqueta="Unidades disponibles" valor={String(disponible)} />
        <Kpi etiqueta="Unidades vendidas" valor={String(vendido)} />
        <Kpi etiqueta="Valor de lo disponible" valor={formatearPesos(valorEnGondola)} />
      </div>

      {abiertos.length > 0 && (
        <Tarjeta titulo="Pedidos en curso">
          <ul className="space-y-2">
            {abiertos.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-borde px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Pedido #{p.numero}</p>
                  <p className="text-xs text-suave">
                    {formatearFecha(p.fecha)} · {p.unidades} unidades
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Plata centavos={p.totalCentavos} />
                  <Estado valor={p.estado} />
                </div>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <Tarjeta titulo="Producto por producto">
        {stock.length === 0 ? (
          <Vacio>Todavía no recibiste entregas. Cuando llegue tu primer pedido, lo vas a ver acá.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Producto</Th>
                <Th alinear="right">Recibido</Th>
                <Th alinear="right">Vendido</Th>
                <Th alinear="right">Disponible</Th>
              </tr>
            </thead>
            <tbody>
              {stock.map((l) => (
                <tr key={l.productoId}>
                  <Td>
                    {l.nombre}
                    {l.presentacion && <span className="block text-xs text-suave">{l.presentacion}</span>}
                  </Td>
                  <Td alinear="right">{l.recibido}</Td>
                  <Td alinear="right">{l.vendido}</Td>
                  <Td alinear="right" className={l.disponible <= 0 ? "font-medium text-rose-700" : "font-medium"}>
                    {l.disponible}
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
