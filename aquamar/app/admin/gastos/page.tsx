import Link from "next/link";
import { Aviso, Boton, Campo, CampoSelect, Kpi, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, formatearPesos, hoy, inicioDeMes } from "@/lib/formato";
import { listarCategorias, listarGastos } from "@/lib/datos/gastos";
import { listarPedidos } from "@/lib/datos/pedidos";
import { accionCambiarCategoria, accionCrearCategoria, accionCrearGasto, accionEliminarGasto } from "../actions";

export const dynamic = "force-dynamic";

export default async function Gastos({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; desde?: string; hasta?: string }>;
}) {
  const { error, desde, hasta } = await searchParams;
  const rango = { desde: desde || inicioDeMes(), hasta: hasta || hoy() };

  const categorias = listarCategorias();
  const activas = categorias.filter((c) => c.activo);
  const gastos = listarGastos(rango);
  const pedidos = listarPedidos().slice(0, 40);
  const total = gastos.reduce((acc, g) => acc + g.montoCentavos, 0);
  const logisticos = gastos.filter((g) => g.tipo === "logistico").reduce((acc, g) => acc + g.montoCentavos, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Gastos</h1>
        <p className="text-sm text-suave">Operativos y logísticos. Podés imputar un gasto a un pedido puntual.</p>
      </div>

      {error && <Aviso texto={error} />}

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-borde bg-white p-4 shadow-sm">
        <Campo etiqueta="Desde" name="desde" type="date" defaultValue={rango.desde} />
        <Campo etiqueta="Hasta" name="hasta" type="date" defaultValue={rango.hasta} />
        <Boton type="submit" variante="secundario">
          Filtrar
        </Boton>
      </form>

      <div className="grid grid-cols-2 gap-3">
        <Kpi etiqueta="Total del período" valor={formatearPesos(total)} tono="malo" />
        <Kpi etiqueta="De logística" valor={formatearPesos(logisticos)} detalle={`${gastos.length} movimientos`} />
      </div>

      <Tarjeta titulo="Cargar gasto">
        {activas.length === 0 ? (
          <Vacio>Primero creá una categoría acá abajo.</Vacio>
        ) : (
          <form action={accionCrearGasto} className="grid gap-3 sm:grid-cols-2">
            <CampoSelect etiqueta="Categoría" name="categoriaId" required>
              {activas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.tipo})
                </option>
              ))}
            </CampoSelect>
            <Campo etiqueta="Monto" name="monto" inputMode="decimal" placeholder="12.500,00" required />
            <Campo etiqueta="Fecha" name="fecha" type="date" defaultValue={hoy()} />
            <CampoSelect etiqueta="Imputar a un pedido (opcional)" name="pedidoId" defaultValue="">
              <option value="">Gasto general</option>
              {pedidos.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.numero} · {p.comercio} · {formatearFecha(p.fecha)}
                </option>
              ))}
            </CampoSelect>
            <div className="sm:col-span-2">
              <Campo etiqueta="Detalle" name="descripcion" placeholder="Opcional" />
            </div>
            <div className="sm:col-span-2">
              <Boton type="submit">Guardar gasto</Boton>
            </div>
          </form>
        )}
      </Tarjeta>

      <Tarjeta titulo="Categorías">
        <p className="mb-3 text-sm text-suave">
          Agregá las que necesites: empleados, servicios, transporte, alquiler, galpón, lo que sea. Las de tipo
          logístico son las que solés imputar a un pedido.
        </p>
        <ul className="mb-4 flex flex-wrap gap-2">
          {categorias.map((c) => (
            <li key={c.id}>
              <form action={accionCambiarCategoria}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="activo" value={c.activo ? "0" : "1"} />
                <button
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    c.activo
                      ? "border-marea-200 bg-marea-50 text-marea-800 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      : "border-borde bg-white text-suave line-through"
                  }`}
                  title={c.activo ? "Archivar" : "Reactivar"}
                >
                  {c.nombre} · {c.tipo}
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form action={accionCrearCategoria} className="flex flex-wrap items-end gap-3 border-t border-borde pt-4">
          <div className="min-w-[180px] flex-1">
            <Campo etiqueta="Nueva categoría" name="nombre" placeholder="Ej: Combustible" required />
          </div>
          <CampoSelect etiqueta="Tipo" name="tipo" defaultValue="operativo">
            <option value="operativo">Operativo</option>
            <option value="logistico">Logístico</option>
          </CampoSelect>
          <Boton type="submit" variante="secundario">
            Agregar
          </Boton>
        </form>
      </Tarjeta>

      <Tarjeta titulo={`Movimientos · ${formatearFecha(rango.desde)} al ${formatearFecha(rango.hasta)}`}>
        {gastos.length === 0 ? (
          <Vacio>Sin gastos en este período.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Categoría</Th>
                <Th>Detalle</Th>
                <Th alinear="right">Monto</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => (
                <tr key={g.id}>
                  <Td>{formatearFecha(g.fecha)}</Td>
                  <Td>
                    {g.categoria}
                    <span className="block text-xs text-suave">{g.tipo}</span>
                  </Td>
                  <Td>
                    {g.descripcion || <span className="text-suave">—</span>}
                    {g.pedidoId && (
                      <Link href={`/admin/pedidos/${g.pedidoId}`} className="block text-xs text-marea-700">
                        Pedido #{g.numeroPedido}
                      </Link>
                    )}
                  </Td>
                  <Td alinear="right">
                    <Plata centavos={g.montoCentavos} />
                  </Td>
                  <Td alinear="right">
                    <form action={accionEliminarGasto}>
                      <input type="hidden" name="id" value={g.id} />
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
