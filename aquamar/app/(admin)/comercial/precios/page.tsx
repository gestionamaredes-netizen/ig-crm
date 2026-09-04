import Link from "next/link";
import { Aviso, Boton, Campo, CampoSelect, Estado, Plata, Tarjeta, Vacio } from "@/components/ui";
import { centavosAInput, formatearPesos } from "@/lib/formato";
import { NOMBRE_REGIMEN, REGIMENES, regimenActual } from "@/lib/datos/config";
import { listaPredeterminada, listarEscalas, listarListas } from "@/lib/datos/precios";
import { listarProductos } from "@/lib/datos/productos";
import { historialDeProducto } from "@/lib/datos/compras";
import {
  accionActualizarEscala,
  accionActualizarLista,
  accionCrearEscala,
  accionCrearLista,
  accionEliminarEscala,
  accionEliminarLista,
  accionGuardarRegimen,
  accionMarcarPredeterminada,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function Precios({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; lista?: string }>;
}) {
  const { error, lista } = await searchParams;
  const listas = await listarListas();
  const predeterminada = await listaPredeterminada();
  const actual = listas.find((l) => l.id === lista) ?? predeterminada;

  const productos = await listarProductos(true);
  const escalas = actual ? await listarEscalas({ listaId: actual.id }) : [];
  const regimen = await regimenActual();

  const historiales = new Map(
    await Promise.all(productos.map(async (p) => [p.id, await historialDeProducto(p.id)] as const)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Precios</h1>
        <p className="text-sm text-suave">
          Cuánto sale cada producto según cuánto se lleva. Cada comercio puede tener su lista, y al cargar un pedido
          se sugiere la escala que corresponde.
        </p>
      </div>

      {error && <Aviso texto={error} />}

      <Tarjeta titulo="Listas">
        <div className="mb-4 flex flex-wrap gap-2">
          {listas.map((l) => (
            <Link
              key={l.id}
              href={`/comercial/precios?lista=${l.id}`}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                l.id === actual?.id
                  ? "border-azul-600 bg-azul-600 text-white"
                  : "border-borde bg-white text-suave hover:text-azul-700"
              }`}
            >
              {l.nombre}
              {l.predeterminada && (
                <span className={`text-xs ${l.id === actual?.id ? "text-white/70" : "text-suave"}`}>predeterminada</span>
              )}
            </Link>
          ))}
        </div>

        <form action={accionCrearLista} className="flex flex-wrap items-end gap-3 border-t border-borde pt-4">
          <Campo etiqueta="Lista nueva" name="nombre" placeholder="Distribuidor" required />
          <Boton type="submit" variante="secundario">
            Crear lista
          </Boton>
        </form>

        {actual && (
          <div className="mt-4 space-y-2 border-t border-borde pt-4">
            <form action={accionActualizarLista} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={actual.id} />
              <Campo etiqueta="Nombre de esta lista" name="nombre" defaultValue={actual.nombre} required />
              <label className="toque gap-2 text-sm text-suave">
                <input type="checkbox" name="activo" defaultChecked={actual.activo} className="size-5" />
                Activa
              </label>
              <Boton type="submit" variante="secundario">
                Guardar
              </Boton>
            </form>
            {!actual.predeterminada && (
              <div className="flex flex-wrap gap-3 pt-1">
                <form action={accionMarcarPredeterminada}>
                  <input type="hidden" name="id" value={actual.id} />
                  <button className="toque text-xs font-medium text-azul-700">Usar como predeterminada</button>
                </form>
                <form action={accionEliminarLista}>
                  <input type="hidden" name="id" value={actual.id} />
                  <button className="toque text-xs font-medium text-suave hover:text-rose-700">Eliminar lista</button>
                </form>
              </div>
            )}
            <p className="text-xs text-suave">
              La predeterminada es la que se usa con los comercios que no tienen una asignada. La lista de cada
              comercio se elige en su ficha.
            </p>
          </div>
        )}
      </Tarjeta>

      <Tarjeta titulo="Régimen fiscal">
        <p className="mb-3 text-sm text-suave">
          Decide si el IVA que pagás en una compra es crédito fiscal o costo de la mercadería. Cambia el margen de
          todo, así que conviene dejarlo bien de entrada.
        </p>
        <form action={accionGuardarRegimen} className="flex flex-wrap items-end gap-3">
          <CampoSelect etiqueta="Régimen" name="regimen" defaultValue={regimen}>
            {REGIMENES.map((r) => (
              <option key={r} value={r}>
                {NOMBRE_REGIMEN[r]}
              </option>
            ))}
          </CampoSelect>
          <Boton type="submit" variante="secundario">
            Guardar
          </Boton>
        </form>
        <p className="mt-2 text-xs text-suave">
          Las compras ya confirmadas no se recalculan: cada una guarda el régimen con el que se cargó.
        </p>
      </Tarjeta>

      {productos.length === 0 || !actual ? (
        <Tarjeta>
          <Vacio>Primero cargá productos en Depósito → Productos.</Vacio>
        </Tarjeta>
      ) : (
        productos.map((p) => {
          const propias = escalas.filter((e) => e.productoId === p.id);
          const historial = historiales.get(p.id) ?? [];
          const margen = (precio: number) =>
            p.costoCentavos > 0 && precio > 0 ? ((precio - p.costoCentavos) / precio) * 100 : null;

          return (
            <Tarjeta
              key={p.id}
              titulo={p.nombre}
              accion={<Estado valor={actual.nombre} />}
            >
              <div className="mb-4 grid grid-cols-1 gap-2 text-sm min-[420px]:grid-cols-3">
                <Dato etiqueta="Costo promedio" valor={formatearPesos(p.costoCentavos)} />
                <Dato
                  etiqueta="Último costo"
                  valor={p.ultimoCostoCentavos > 0 ? formatearPesos(p.ultimoCostoCentavos) : "—"}
                />
                <Dato etiqueta="Precio de catálogo" valor={formatearPesos(p.precioCentavos)} />
              </div>

              {propias.length === 0 ? (
                <p className="mb-4 text-sm text-suave">
                  Sin escalas en esta lista: los pedidos salen al precio de catálogo,{" "}
                  {formatearPesos(p.precioCentavos)}.
                </p>
              ) : (
                <ul className="mb-4 space-y-2">
                  {propias.map((e) => {
                    const pct = margen(e.precioCentavos);
                    return (
                      <li key={e.id} className={`rounded-xl border border-borde p-3 ${e.activo ? "" : "opacity-60"}`}>
                        <form action={accionActualizarEscala} className="grid gap-2 min-[420px]:grid-cols-3">
                          <input type="hidden" name="id" value={e.id} />
                          <Campo etiqueta="Nombre" name="nombre" defaultValue={e.nombre} required />
                          <Campo
                            etiqueta="Desde (unid.)"
                            name="desdeCantidad"
                            inputMode="numeric"
                            defaultValue={String(e.desdeCantidad)}
                          />
                          <Campo
                            etiqueta="Precio"
                            name="precio"
                            inputMode="decimal"
                            defaultValue={centavosAInput(e.precioCentavos)}
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2 min-[420px]:col-span-3">
                            <span className="text-xs text-suave">
                              Margen:{" "}
                              <strong className="text-tinta">
                                <Plata centavos={e.precioCentavos - p.costoCentavos} tono />
                              </strong>
                              {pct !== null && ` (${pct.toFixed(1)}%)`}
                            </span>
                            <div className="flex items-center gap-3">
                              <label className="toque gap-2 text-xs text-suave">
                                <input type="checkbox" name="activo" defaultChecked={e.activo} className="size-5" />
                                Activa
                              </label>
                              <Boton type="submit" variante="secundario">
                                Guardar
                              </Boton>
                            </div>
                          </div>
                        </form>
                        <form action={accionEliminarEscala} className="mt-2 border-t border-borde pt-2">
                          <input type="hidden" name="id" value={e.id} />
                          <button className="toque text-xs font-medium text-suave hover:text-rose-700">
                            Eliminar escala
                          </button>
                        </form>
                      </li>
                    );
                  })}
                </ul>
              )}

              <form action={accionCrearEscala} className="grid gap-2 border-t border-borde pt-4 min-[420px]:grid-cols-3">
                <input type="hidden" name="productoId" value={p.id} />
                <input type="hidden" name="listaId" value={actual.id} />
                <Campo etiqueta="Nueva escala" name="nombre" placeholder="+10 bultos" required />
                <Campo etiqueta="Desde (unid.)" name="desdeCantidad" inputMode="numeric" placeholder="10" required />
                <Campo etiqueta="Precio" name="precio" inputMode="decimal" placeholder="6.500,00" required />
                <div className="min-[420px]:col-span-3">
                  <Boton type="submit">Agregar escala</Boton>
                </div>
              </form>

              {historial.length > 0 && (
                <details className="mt-4 border-t border-borde pt-3">
                  <summary className="toque cursor-pointer text-xs font-medium text-azul-700">
                    Historial de costos ({historial.length} {historial.length === 1 ? "compra" : "compras"})
                  </summary>
                  <ul className="mt-2 space-y-1.5">
                    {historial.map((h) => (
                      <li key={h.compraId} className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                        <span className="text-suave">
                          #{h.numero} · {h.proveedor} · {h.cantidad} unid.
                        </span>
                        <span className="tabular">{formatearPesos(h.costoRealUnitCentavos)} c/u</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </Tarjeta>
          );
        })
      )}
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl bg-fondo px-3 py-2">
      <p className="text-xs text-suave">{etiqueta}</p>
      <p className="tabular font-medium">{valor}</p>
    </div>
  );
}
