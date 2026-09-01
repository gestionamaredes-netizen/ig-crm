import Link from "next/link";
import { Aviso, Boton, Campo, CampoSelect, CampoTexto, Tarjeta, Vacio } from "@/components/ui";
import { formatearPesos, hoy } from "@/lib/formato";
import { listarClientes } from "@/lib/datos/clientes";
import { listarProductos } from "@/lib/datos/productos";
import { accionCrearPedido } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NuevoPedido({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; error?: string }>;
}) {
  const { cliente, error } = await searchParams;
  const clientes = listarClientes().filter((c) => c.activo);
  const productos = listarProductos(true);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pedidos" className="text-xs font-medium text-marea-700">
          ← Pedidos
        </Link>
        <h1 className="text-lg font-semibold tracking-tight">Nuevo pedido</h1>
        <p className="text-sm text-suave">Los precios quedan congelados con la lista de hoy.</p>
      </div>

      {error && <Aviso texto={error} />}

      {clientes.length === 0 || productos.length === 0 ? (
        <Tarjeta>
          <Vacio>
            {clientes.length === 0
              ? "Primero cargá un comercio en Clientes."
              : "Primero cargá productos en Inventario."}
          </Vacio>
        </Tarjeta>
      ) : (
        <form action={accionCrearPedido} className="space-y-4">
          <Tarjeta titulo="Datos">
            <div className="grid gap-3 sm:grid-cols-2">
              <CampoSelect etiqueta="Comercio" name="clienteId" defaultValue={cliente ?? ""} required>
                <option value="" disabled>
                  Elegí un comercio
                </option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.comercio}
                  </option>
                ))}
              </CampoSelect>
              <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
              <div className="sm:col-span-2">
                <CampoTexto etiqueta="Notas" name="notas" rows={2} placeholder="Horario de entrega, forma de pago…" />
              </div>
            </div>
          </Tarjeta>

          <Tarjeta titulo="Productos">
            <ul className="divide-y divide-[#dde7ec]">
              {productos.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.nombre}</p>
                    <p className="text-xs text-suave">
                      {p.presentacion && `${p.presentacion} · `}
                      {formatearPesos(p.precioCentavos)} · stock {p.stock}
                    </p>
                  </div>
                  <input
                    name={`cant_${p.id}`}
                    inputMode="numeric"
                    placeholder="0"
                    className="w-20 rounded-xl border border-borde px-3 py-2 text-center text-sm outline-none focus:border-marea-400 focus:ring-2 focus:ring-marea-100"
                  />
                </li>
              ))}
            </ul>
          </Tarjeta>

          <Boton type="submit">Crear pedido</Boton>
        </form>
      )}
    </div>
  );
}
