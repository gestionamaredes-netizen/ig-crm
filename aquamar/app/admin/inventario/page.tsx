import { Aviso, Boton, Campo, Plata, Tarjeta, Vacio } from "@/components/ui";
import { centavosAInput, formatearPesos } from "@/lib/formato";
import { listarProductos, margenPorcentual, margenUnitario } from "@/lib/datos/productos";
import { accionActualizarProducto, accionCambiarEstadoProducto, accionCrearProducto } from "../actions";

export const dynamic = "force-dynamic";

export default async function Inventario({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const productos = listarProductos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Inventario</h1>
        <p className="text-sm text-suave">Stock, costo y precio de venta. El margen se recalcula solo.</p>
      </div>

      {error && <Aviso texto={error} />}

      <Tarjeta titulo="Agregar producto">
        <form action={accionCrearProducto} className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Nombre" name="nombre" placeholder="Powerfull 3 en 1" required />
          <Campo etiqueta="Presentación" name="presentacion" placeholder="Caja x 30 cápsulas" />
          <Campo etiqueta="Stock inicial" name="stock" inputMode="numeric" defaultValue="0" />
          <div className="grid grid-cols-2 gap-3">
            <Campo etiqueta="Costo" name="costo" inputMode="decimal" placeholder="0,00" />
            <Campo etiqueta="Precio de venta" name="precio" inputMode="decimal" placeholder="0,00" />
          </div>
          <div className="sm:col-span-2">
            <Boton type="submit">Agregar</Boton>
          </div>
        </form>
      </Tarjeta>

      {productos.length === 0 ? (
        <Tarjeta>
          <Vacio>No hay productos cargados todavía.</Vacio>
        </Tarjeta>
      ) : (
        <div className="space-y-3">
          {productos.map((p) => {
            const porcentaje = margenPorcentual(p);
            return (
              <Tarjeta key={p.id} className={p.activo ? "" : "opacity-60"}>
                <form action={accionActualizarProducto} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={p.id} />
                  <Campo etiqueta="Nombre" name="nombre" defaultValue={p.nombre} required />
                  <Campo etiqueta="Presentación" name="presentacion" defaultValue={p.presentacion} />
                  <Campo etiqueta="Stock" name="stock" inputMode="numeric" defaultValue={String(p.stock)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Campo etiqueta="Costo" name="costo" inputMode="decimal" defaultValue={centavosAInput(p.costoCentavos)} />
                    <Campo
                      etiqueta="Precio de venta"
                      name="precio"
                      inputMode="decimal"
                      defaultValue={centavosAInput(p.precioCentavos)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                    <p className="text-sm text-suave">
                      Margen por unidad:{" "}
                      <strong className="text-tinta">
                        <Plata centavos={margenUnitario(p)} tono />
                      </strong>
                      {porcentaje !== null && <span className="ml-1">({porcentaje.toFixed(1)}%)</span>}
                      <span className="ml-3">
                        Valor del stock: {formatearPesos(p.stock * p.costoCentavos)}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <Boton type="submit">Guardar</Boton>
                    </div>
                  </div>
                </form>

                <form action={accionCambiarEstadoProducto} className="mt-2 border-t border-borde pt-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="activo" value={p.activo ? "0" : "1"} />
                  <button className="text-xs font-medium text-suave hover:text-marea-700">
                    {p.activo ? "Archivar producto" : "Reactivar producto"}
                  </button>
                </form>
              </Tarjeta>
            );
          })}
        </div>
      )}
    </div>
  );
}
