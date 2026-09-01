import Link from "next/link";
import { Aviso, Boton, Campo, CampoSelect, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, hoy } from "@/lib/formato";
import { listarProductos } from "@/lib/datos/productos";
import { listarMovimientos } from "@/lib/datos/stock";
import { accionRegistrarAjuste, accionRegistrarEntrada } from "../actions";

export const dynamic = "force-dynamic";

const ETIQUETA_TIPO: Record<string, string> = {
  entrada: "Entrada",
  salida: "Entrega",
  ajuste: "Ajuste",
  devolucion: "Devolución",
};

export default async function Movimientos({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; producto?: string }>;
}) {
  const { error, producto } = await searchParams;
  const productos = listarProductos(true);
  const movimientos = listarMovimientos({ productoId: producto || undefined });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Movimientos</h1>
        <p className="text-sm text-suave">
          Todo lo que entra y sale del depósito. Las entregas de pedidos se anotan solas.
        </p>
      </div>

      {error && <Aviso texto={error} />}

      {productos.length === 0 ? (
        <Tarjeta>
          <Vacio>
            Primero cargá un producto en{" "}
            <Link href="/deposito/productos" className="text-marea-700">
              Productos
            </Link>
            .
          </Vacio>
        </Tarjeta>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <Tarjeta titulo="Entrada de mercadería">
            <form action={accionRegistrarEntrada} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <CampoSelect etiqueta="Producto" name="productoId" required>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (hay {p.stock})
                    </option>
                  ))}
                </CampoSelect>
              </div>
              <Campo etiqueta="Cantidad" name="cantidad" inputMode="numeric" placeholder="100" required />
              <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
              <div className="sm:col-span-2">
                <Campo etiqueta="Motivo" name="motivo" placeholder="Compra de mercadería" />
              </div>
              <div className="sm:col-span-2">
                <Boton type="submit">Sumar al depósito</Boton>
              </div>
            </form>
          </Tarjeta>

          <Tarjeta titulo="Ajuste de inventario">
            <p className="mb-3 text-sm text-suave">
              Para cuando el conteo no da: rotura, faltante o unidades que aparecieron.
            </p>
            <form action={accionRegistrarAjuste} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <CampoSelect etiqueta="Producto" name="productoId" required>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (hay {p.stock})
                    </option>
                  ))}
                </CampoSelect>
              </div>
              <CampoSelect etiqueta="Qué pasó" name="sentido" defaultValue="resta">
                <option value="resta">Faltan unidades</option>
                <option value="suma">Sobran unidades</option>
              </CampoSelect>
              <Campo etiqueta="Cantidad" name="cantidad" inputMode="numeric" placeholder="3" required />
              <div className="sm:col-span-2">
                <Campo etiqueta="Motivo" name="motivo" placeholder="Cajas rotas en el galpón" required />
              </div>
              <div className="sm:col-span-2">
                <Boton type="submit" variante="secundario">
                  Registrar ajuste
                </Boton>
              </div>
            </form>
          </Tarjeta>
        </div>
      )}

      <Tarjeta titulo="Historial">
        <form className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <CampoSelect etiqueta="Filtrar por producto" name="producto" defaultValue={producto ?? ""}>
              <option value="">Todos</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </CampoSelect>
          </div>
          <Boton type="submit" variante="secundario">
            Filtrar
          </Boton>
        </form>

        {movimientos.length === 0 ? (
          <Vacio>Sin movimientos registrados.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Producto</Th>
                <Th>Concepto</Th>
                <Th alinear="right">Cantidad</Th>
                <Th alinear="right">Quedaron</Th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <Td>{formatearFecha(m.fecha)}</Td>
                  <Td>{m.producto}</Td>
                  <Td>
                    <span className="block">{ETIQUETA_TIPO[m.tipo] ?? m.tipo}</span>
                    <span className="block text-xs text-suave">
                      {m.numeroPedido ? (
                        <Link href={`/comercial/pedidos/${m.pedidoId}`} className="text-marea-700">
                          Pedido #{m.numeroPedido}
                        </Link>
                      ) : (
                        m.motivo || "—"
                      )}
                    </span>
                  </Td>
                  <Td alinear="right">
                    <span className={`tabular font-medium ${m.cantidad < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                      {m.cantidad > 0 ? "+" : ""}
                      {m.cantidad}
                    </span>
                  </Td>
                  <Td alinear="right" className="tabular">
                    {m.stockResultante}
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
