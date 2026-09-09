import Link from "next/link";
import { Aviso, Boton, Campo, Tarjeta, Vacio } from "@/components/ui";
import { listarProductos } from "@/lib/datos/productos";
import { textoBultos } from "@/lib/formato";
import { accionActualizarProducto, accionCambiarEstadoProducto, accionCrearProducto } from "../actions";

export const dynamic = "force-dynamic";

export default async function Productos({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const productos = await listarProductos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Productos</h1>
        <p className="text-sm text-suave">
          Nombre, presentación y punto de reposición. El stock no se edita acá: se mueve desde{" "}
          <Link href="/deposito/movimientos" className="text-azul-700">
            Movimientos
          </Link>
          , para que quede el registro de por qué cambió.
        </p>
      </div>

      {error && <Aviso texto={error} />}

      <Tarjeta titulo="Agregar producto">
        <form action={accionCrearProducto} className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Nombre" name="nombre" placeholder="Powerful 3 en 1" required />
          <Campo etiqueta="Presentación" name="presentacion" placeholder="Caja x 20 cápsulas" />
          <Campo
            etiqueta="Unidades por bulto"
            name="unidadesPorBulto"
            inputMode="numeric"
            defaultValue="12"
            ayuda="Cuántas cajas trae un bulto"
          />
          <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
            <Campo
              etiqueta="Stock inicial"
              name="stock"
              inputMode="numeric"
              defaultValue="0"
              ayuda="En unidades"
            />
            <Campo
              etiqueta="Stock mínimo"
              name="stockMinimo"
              inputMode="numeric"
              defaultValue="0"
              ayuda="En unidades, para el aviso"
            />
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
            return (
              <Tarjeta key={p.id} className={p.activo ? "" : "opacity-60"}>
                <form action={accionActualizarProducto} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={p.id} />
                  <Campo etiqueta="Nombre" name="nombre" defaultValue={p.nombre} required />
                  <Campo etiqueta="Presentación" name="presentacion" defaultValue={p.presentacion} />
                  <Campo
                    etiqueta="Unidades por bulto"
                    name="unidadesPorBulto"
                    inputMode="numeric"
                    defaultValue={String(p.unidadesPorBulto)}
                  />
                  <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
                    <Campo
                      etiqueta="Stock mínimo"
                      name="stockMinimo"
                      inputMode="numeric"
                      defaultValue={String(p.stockMinimo)}
                      ayuda="0 = sin aviso"
                    />
                    <div>
                      <span className="mb-1 block text-xs font-medium text-suave">En depósito</span>
                      <p className="tabular rounded-xl border border-dashed border-borde px-3 py-2 text-sm text-suave">
                        {textoBultos(p.stock, p.unidadesPorBulto)}
                        <span className="block text-xs">{p.stock} unidades</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end sm:col-span-2">
                    <Boton type="submit">Guardar</Boton>
                  </div>
                </form>

                <form action={accionCambiarEstadoProducto} className="mt-2 border-t border-borde pt-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="activo" value={p.activo ? "0" : "1"} />
                  <button className="toque text-xs font-medium text-suave hover:text-azul-700">
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
