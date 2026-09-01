import { Aviso, Boton, Campo, CampoSelect, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, hoy } from "@/lib/formato";
import { requerirCliente } from "@/lib/auth";
import { stockDelCliente, ventasDelCliente } from "@/lib/datos/panel";
import { accionEliminarVenta, accionRegistrarVenta } from "../actions";

export const dynamic = "force-dynamic";

export default async function Ventas({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const sesion = await requerirCliente();
  const stock = stockDelCliente(sesion.clienteId);
  const ventas = ventasDelCliente(sesion.clienteId);
  const conDisponible = stock.filter((l) => l.disponible > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Mis ventas</h1>
        <p className="text-sm text-suave">Anotá lo que vas vendiendo y tu stock se actualiza solo.</p>
      </div>

      {error && <Aviso texto={error} />}

      <Tarjeta titulo="Registrar una venta">
        {conDisponible.length === 0 ? (
          <Vacio>No tenés unidades disponibles para descontar.</Vacio>
        ) : (
          <form action={accionRegistrarVenta} className="grid gap-3 sm:grid-cols-3">
            <CampoSelect etiqueta="Producto" name="productoId" required>
              {conDisponible.map((l) => (
                <option key={l.productoId} value={l.productoId}>
                  {l.nombre} (te quedan {l.disponible})
                </option>
              ))}
            </CampoSelect>
            <Campo etiqueta="Cantidad" name="cantidad" inputMode="numeric" placeholder="0" required />
            <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
            <div className="sm:col-span-3">
              <Boton type="submit">Anotar venta</Boton>
            </div>
          </form>
        )}
      </Tarjeta>

      <Tarjeta titulo="Historial">
        {ventas.length === 0 ? (
          <Vacio>Todavía no anotaste ventas.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Producto</Th>
                <Th alinear="right">Cantidad</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id}>
                  <Td>{formatearFecha(v.fecha)}</Td>
                  <Td>
                    {v.nombre}
                    {v.registradoPor && <span className="block text-xs text-suave">Cargó: {v.registradoPor}</span>}
                  </Td>
                  <Td alinear="right">{v.cantidad}</Td>
                  <Td alinear="right">
                    <form action={accionEliminarVenta}>
                      <input type="hidden" name="id" value={v.id} />
                      <button className="text-xs text-suave hover:text-rose-700">Borrar</button>
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
