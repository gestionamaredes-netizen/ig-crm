import Link from "next/link";
import { BotonLink, Kpi, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import { listarMovimientos, resumenDeposito } from "@/lib/datos/stock";
import { rotacion } from "@/lib/datos/rotacion";

export const dynamic = "force-dynamic";

export default async function Deposito() {
  const d = await resumenDeposito();
  const ultimos = await listarMovimientos({ limite: 8 });
  const ritmo = await rotacion();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Depósito</h1>
          <p className="text-sm text-suave">Qué hay, qué está comprometido y qué falta reponer.</p>
        </div>
        <BotonLink href="/deposito/movimientos">Registrar entrada</BotonLink>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
        <Kpi etiqueta="Unidades en depósito" valor={String(d.unidades)} />
        <Kpi
          etiqueta="Libres para vender"
          valor={String(d.libre)}
          detalle={`${d.comprometido} comprometidas en pedidos`}
          tono={d.libre <= 0 ? "malo" : "neutro"}
        />
        <Kpi etiqueta="Valor a costo" valor={formatearPesos(d.valorCosto)} />
        <Kpi etiqueta="Valor a precio de venta" valor={formatearPesos(d.valorVenta)} tono="bueno" />
      </div>

      <Tarjeta titulo="Cuánto aguanta el depósito">
        <p className="mb-3 text-sm text-suave">
          Al ritmo de venta de los últimos 60 días. La sugerencia es lo que faltaría comprar para no quedarse sin
          mercadería.
        </p>
        {ritmo.length === 0 ? (
          <Vacio>No hay productos activos.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Producto</Th>
                <Th alinear="right">Libres</Th>
                <Th alinear="right">Por semana</Th>
                <Th alinear="right">Aguanta</Th>
                <Th alinear="right">Comprar</Th>
              </tr>
            </thead>
            <tbody>
              {ritmo.map((l) => (
                <tr key={l.id}>
                  <Td>
                    <span className="font-medium">{l.nombre}</span>
                    {l.sinMovimiento && <span className="block text-xs text-suave">sin ventas en el período</span>}
                  </Td>
                  <Td alinear="right" className="tabular">
                    {l.libre}
                  </Td>
                  <Td alinear="right" className="tabular text-suave">
                    {l.ventaSemanal > 0 ? l.ventaSemanal.toFixed(1) : "—"}
                  </Td>
                  <Td alinear="right">
                    {l.diasDeStock === null ? (
                      <span className="text-suave">—</span>
                    ) : (
                      <span
                        className={`tabular font-medium ${
                          l.diasDeStock < 15 ? "text-rose-700" : l.diasDeStock < 30 ? "text-amber-700" : ""
                        }`}
                      >
                        {l.diasDeStock} días
                      </span>
                    )}
                  </Td>
                  <Td alinear="right" className="tabular">
                    {l.sugerenciaCompra > 0 ? <strong>{l.sugerenciaCompra}</strong> : <span className="text-suave">—</span>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>

      {d.aReponer.length > 0 && (
        <Tarjeta titulo="Hay que reponer">
          <ul className="space-y-2">
            {d.aReponer.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
              >
                <span className="text-sm font-medium text-amber-900">{l.nombre}</span>
                <span className="text-sm text-amber-800">
                  quedan {l.libre} libres · mínimo {l.stockMinimo}
                </span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <Tarjeta
        titulo="Stock por producto"
        accion={
          <Link href="/deposito/productos" className="toque text-xs font-medium text-azul-700">
            Editar productos
          </Link>
        }
      >
        {d.lineas.length === 0 ? (
          <Vacio>
            No hay productos activos. Cargá el primero en{" "}
            <Link href="/deposito/productos" className="text-azul-700">
              Productos
            </Link>
            .
          </Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Producto</Th>
                <Th alinear="right">En depósito</Th>
                <Th alinear="right">Comprometido</Th>
                <Th alinear="right">Libre</Th>
                <Th alinear="right">Valor a costo</Th>
              </tr>
            </thead>
            <tbody>
              {d.lineas.map((l) => (
                <tr key={l.id}>
                  <Td>
                    {l.nombre}
                    {l.presentacion && <span className="block text-xs text-suave">{l.presentacion}</span>}
                  </Td>
                  <Td alinear="right">{l.stock}</Td>
                  <Td alinear="right">{l.comprometido}</Td>
                  <Td alinear="right" className={l.bajoMinimo ? "font-medium text-amber-700" : "font-medium"}>
                    {l.libre}
                  </Td>
                  <Td alinear="right">
                    <Plata centavos={l.stock * l.costoCentavos} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>

      <Tarjeta
        titulo="Últimos movimientos"
        accion={
          <Link href="/deposito/movimientos" className="toque text-xs font-medium text-azul-700">
            Ver todos
          </Link>
        }
      >
        {ultimos.length === 0 ? (
          <Vacio>Todavía no hubo movimientos.</Vacio>
        ) : (
          <ul className="space-y-2">
            {ultimos.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-borde px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.producto}</p>
                  <p className="truncate text-xs text-suave">
                    {formatearFecha(m.fecha)} · {m.motivo || m.tipo}
                  </p>
                </div>
                <span className={`tabular text-sm font-medium ${m.cantidad < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                  {m.cantidad > 0 ? "+" : ""}
                  {m.cantidad}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </div>
  );
}
