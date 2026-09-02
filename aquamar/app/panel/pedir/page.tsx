import { Aviso, Boton, CampoTexto, Tarjeta, Vacio } from "@/components/ui";
import { formatearPesos } from "@/lib/formato";
import { listarProductos } from "@/lib/datos/productos";
import { accionPedirDesdePanel } from "../actions";

export const dynamic = "force-dynamic";

export default async function Pedir({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const productos = await listarProductos(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Hacer un pedido</h1>
        <p className="text-sm text-suave">Poné las cantidades que necesitás. Te confirmamos antes de salir a entregar.</p>
      </div>

      {error && <Aviso texto={error} />}

      {productos.length === 0 ? (
        <Tarjeta>
          <Vacio>No hay productos disponibles en este momento.</Vacio>
        </Tarjeta>
      ) : (
        <form action={accionPedirDesdePanel} className="space-y-4">
          <Tarjeta titulo="Productos">
            <ul className="divide-y divide-[#dde7ec]">
              {productos.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.nombre}</p>
                    <p className="text-xs text-suave">
                      {p.presentacion && `${p.presentacion} · `}
                      {formatearPesos(p.precioCentavos)}
                    </p>
                  </div>
                  <input
                    name={`cant_${p.id}`}
                    inputMode="numeric"
                    placeholder="0"
                    aria-label={`Cantidad de ${p.nombre}`}
                    className="w-20 rounded-xl border border-borde px-3 py-2 text-center text-sm outline-none focus:border-celeste-400 focus:ring-2 focus:ring-azul-100"
                  />
                </li>
              ))}
            </ul>
          </Tarjeta>

          <Tarjeta titulo="Algo más">
            <CampoTexto etiqueta="Comentario" name="notas" rows={2} placeholder="Horario que te queda cómodo, cambios, etc." />
          </Tarjeta>

          <Boton type="submit" className="w-full sm:w-auto">
            Enviar pedido
          </Boton>
        </form>
      )}
    </div>
  );
}
