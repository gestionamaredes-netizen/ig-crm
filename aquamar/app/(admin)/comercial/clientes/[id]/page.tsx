import Link from "next/link";
import { notFound } from "next/navigation";
import { Aviso, Boton, Campo, CampoTexto, Estado, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { LinkAcceso } from "@/components/link-acceso";
import { formatearFecha } from "@/lib/formato";
import { listarAccesos, obtenerCliente } from "@/lib/datos/clientes";
import { baseUrl } from "@/lib/url";
import { listarPedidos } from "@/lib/datos/pedidos";
import { stockDelCliente } from "@/lib/datos/panel";
import { accionActualizarCliente, accionCambiarAcceso, accionCrearAcceso, accionRegenerarToken } from "../../actions";

export const dynamic = "force-dynamic";

export default async function FichaCliente({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const cliente = obtenerCliente(id);
  if (!cliente) notFound();

  const accesos = listarAccesos(id);
  const base = await baseUrl();
  const pedidos = listarPedidos({ clienteId: id });
  const stock = stockDelCliente(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/comercial/clientes" className="text-xs font-medium text-marea-700">
            ← Clientes
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">{cliente.comercio}</h1>
          <p className="text-sm text-suave">{cliente.persona || "Sin contacto cargado"}</p>
        </div>
        <Link href={`/comercial/pedidos/nuevo?cliente=${cliente.id}`} className="rounded-xl bg-marea-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-marea-700">
          Cargar pedido
        </Link>
      </div>

      {error && <Aviso texto={error} />}

      <Tarjeta titulo="Ficha">
        <form action={accionActualizarCliente} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={cliente.id} />
          <Campo etiqueta="Nombre del comercio" name="comercio" defaultValue={cliente.comercio} required />
          <Campo etiqueta="Persona que compra" name="persona" defaultValue={cliente.persona} />
          <Campo etiqueta="Teléfono" name="telefono" inputMode="tel" defaultValue={cliente.telefono} />
          <Campo etiqueta="Email" name="email" type="email" defaultValue={cliente.email} />
          <Campo etiqueta="Dirección" name="direccion" defaultValue={cliente.direccion} />
          <Campo etiqueta="Redes sociales" name="redes" defaultValue={cliente.redes} placeholder="Opcional" />
          <div className="sm:col-span-2">
            <CampoTexto etiqueta="Notas" name="notas" rows={2} defaultValue={cliente.notas} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="activo" defaultChecked={cliente.activo} className="size-4 accent-[#0d848b]" />
            Cliente activo
          </label>
          <div className="sm:col-span-2">
            <Boton type="submit">Guardar ficha</Boton>
          </div>
        </form>
      </Tarjeta>

      <Tarjeta titulo="Accesos al panel">
        <p className="mb-3 text-sm text-suave">
          Cada link entra directo al panel del comercio. Sumá uno aparte para el representante que gestiona los pedidos:
          si deja de trabajar con vos, lo desactivás sin tocar el del dueño.
        </p>

        <ul className="space-y-3">
          {accesos.map((a) => (
            <li key={a.id} className="rounded-xl border border-borde p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {a.nombre} <span className="text-xs font-normal text-suave">({a.rol})</span>
                  </p>
                  <p className="text-xs text-suave">
                    {a.ultimoAccesoEn ? `Último ingreso: ${formatearFecha(a.ultimoAccesoEn)}` : "Todavía no ingresó"}
                  </p>
                </div>
                {!a.activo && <span className="text-xs font-medium text-rose-700">Revocado</span>}
              </div>

              {a.activo && <LinkAcceso url={`${base}/acceso/${a.token}`} />}

              <div className="mt-2 flex gap-3">
                <form action={accionCambiarAcceso}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="clienteId" value={cliente.id} />
                  <input type="hidden" name="activo" value={a.activo ? "0" : "1"} />
                  <button className="text-xs font-medium text-suave hover:text-marea-700">
                    {a.activo ? "Revocar acceso" : "Reactivar"}
                  </button>
                </form>
                <form action={accionRegenerarToken}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="clienteId" value={cliente.id} />
                  <button className="text-xs font-medium text-suave hover:text-marea-700">Generar link nuevo</button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <form action={accionCrearAcceso} className="mt-4 flex flex-wrap items-end gap-3 border-t border-borde pt-4">
          <input type="hidden" name="clienteId" value={cliente.id} />
          <div className="min-w-[200px] flex-1">
            <Campo etiqueta="Nombre del representante" name="nombre" placeholder="Ej: Vendedor de zona norte" required />
          </div>
          <Boton type="submit" variante="secundario">
            Sumar acceso
          </Boton>
        </form>
      </Tarjeta>

      <Tarjeta titulo="Stock en el comercio">
        {stock.length === 0 ? (
          <Vacio>Todavía no recibió entregas.</Vacio>
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
                  <Td>{l.nombre}</Td>
                  <Td alinear="right">{l.recibido}</Td>
                  <Td alinear="right">{l.vendido}</Td>
                  <Td alinear="right" className="font-medium">
                    {l.disponible}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>

      <Tarjeta titulo="Pedidos">
        {pedidos.length === 0 ? (
          <Vacio>Sin pedidos todavía.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th>Fecha</Th>
                <Th>Estado</Th>
                <Th alinear="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/comercial/pedidos/${p.id}`} className="font-medium text-marea-700">
                      #{p.numero}
                    </Link>
                  </Td>
                  <Td>{formatearFecha(p.fecha)}</Td>
                  <Td>
                    <Estado valor={p.estado} />
                  </Td>
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
