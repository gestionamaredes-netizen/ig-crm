import Link from "next/link";
import { BotonLink, Estado, Kpi, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, formatearPesos, hoy, inicioDeMes } from "@/lib/formato";
import { listarPedidos } from "@/lib/datos/pedidos";
import { listarProductos } from "@/lib/datos/productos";
import { listarClientes } from "@/lib/datos/clientes";
import { resumen } from "@/lib/datos/reportes";

export const dynamic = "force-dynamic";

export default function Tablero() {
  const rango = { desde: inicioDeMes(), hasta: hoy() };
  const mes = resumen(rango);
  const pedidos = listarPedidos().slice(0, 8);
  const productos = listarProductos(true);
  const clientes = listarClientes().filter((c) => c.activo);
  const sinStock = productos.filter((p) => p.stock <= 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Tablero</h1>
          <p className="text-sm text-suave">
            Mes en curso · {formatearFecha(rango.desde)} al {formatearFecha(rango.hasta)}
          </p>
        </div>
        <BotonLink href="/admin/pedidos/nuevo">Nuevo pedido</BotonLink>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi etiqueta="Ventas entregadas" valor={formatearPesos(mes.ingresosCentavos)} detalle={`${mes.unidades} unidades`} />
        <Kpi etiqueta="Margen bruto" valor={formatearPesos(mes.margenBruto)} tono="bueno" detalle="Venta menos costo" />
        <Kpi etiqueta="Gastos del mes" valor={formatearPesos(mes.gastosCentavos)} tono="malo" />
        <Kpi
          etiqueta="Resultado neto"
          valor={formatearPesos(mes.neto)}
          tono={mes.neto >= 0 ? "bueno" : "malo"}
          detalle={mes.netoPorcentual !== null ? `${mes.netoPorcentual.toFixed(1)}% sobre ventas` : undefined}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi etiqueta="Pedidos abiertos" valor={String(mes.pedidosAbiertos)} detalle="Pendientes o en preparación" />
        <Kpi etiqueta="Comercios activos" valor={String(clientes.length)} />
        <Kpi
          etiqueta="Productos sin stock"
          valor={String(sinStock.length)}
          tono={sinStock.length > 0 ? "malo" : "neutro"}
          detalle={sinStock.map((p) => p.nombre).join(", ") || "Todo con stock"}
        />
      </div>

      <Tarjeta titulo="Últimos pedidos" accion={<Link href="/admin/pedidos" className="text-xs font-medium text-marea-700">Ver todos</Link>}>
        {pedidos.length === 0 ? (
          <Vacio>Todavía no hay pedidos cargados.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th>Comercio</Th>
                <Th>Estado</Th>
                <Th alinear="right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/admin/pedidos/${p.id}`} className="font-medium text-marea-700">
                      #{p.numero}
                    </Link>
                    <span className="ml-2 text-xs text-suave">{formatearFecha(p.fecha)}</span>
                  </Td>
                  <Td>{p.comercio}</Td>
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
