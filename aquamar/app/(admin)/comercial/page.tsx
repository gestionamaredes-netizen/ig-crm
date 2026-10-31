import Link from "next/link";
import { BotonLink, Estado, Kpi, Plata, Tabla, Tarjeta, Td, Th, Vacio } from "@/components/ui";
import { formatearFecha, formatearPesos, formatearPorcentaje, hoy, inicioDeMes } from "@/lib/formato";
import { listarPedidos } from "@/lib/datos/pedidos";
import { listarClientes } from "@/lib/datos/clientes";
import { indicadores, rentabilidadPorCliente, resumen } from "@/lib/datos/reportes";
import { resumenDeposito } from "@/lib/datos/stock";
import { saldoDeAnticipos } from "@/lib/datos/anticipos";
import { saldos } from "@/lib/datos/caja";
import { cuentasPorCobrar } from "@/lib/datos/pedidos";
import { cuentasPorPagar } from "@/lib/datos/compras";
import { aReponer } from "@/lib/datos/rotacion";
import { listarCierres } from "@/lib/datos/cierre";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const rango = { desde: inicioDeMes(), hasta: hoy() };
  const mes = await resumen(rango);
  const pedidos = await listarPedidos();
  const abiertos = pedidos.filter((p) => p.estado === "pendiente" || p.estado === "preparando");
  const clientes = (await listarClientes()).filter((c) => c.activo);
  const ranking = (await rentabilidadPorCliente(rango)).slice(0, 5);
  const deposito = await resumenDeposito();
  const anticipos = await saldoDeAnticipos();
  const kpis = indicadores(mes);
  const caja = await saldos();
  const porCobrar = await cuentasPorCobrar();
  const porPagar = await cuentasPorPagar();
  const reponer = await aReponer();
  const ultimoCierre = (await listarCierres())[0];

  const aCobrar = porCobrar.reduce((a, d) => a + d.saldoCentavos, 0);
  const aPagar = porPagar.reduce((a, d) => a + d.saldoCentavos, 0);
  const preparando = pedidos.filter((p) => p.estado === "preparando").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-suave">
            Mes en curso · {formatearFecha(rango.desde)} al {formatearFecha(rango.hasta)}
          </p>
        </div>
        <BotonLink href="/comercial/pedidos/nuevo">Nuevo pedido</BotonLink>
      </div>

      {/*
        * Los seis números de la rentabilidad, en el orden en que se llega a
        * ellos: de lo que se vendió a lo que queda. Todos sobre la venta sin
        * IVA, que es la plata de Aqua Mar; el IVA se le cobra al comercio y se
        * le entrega a AFIP.
        */}
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-3">
        <Kpi
          etiqueta="Ventas sin IVA"
          valor={formatearPesos(mes.ventaNetaCentavos)}
          detalle={`${mes.unidades} unidades · ${formatearPesos(mes.ventaBrutaCentavos)} facturado`}
        />
        <Kpi
          etiqueta="Margen bruto"
          valor={formatearPesos(mes.margenBrutoCentavos)}
          tono={mes.margenBrutoCentavos >= 0 ? "bueno" : "malo"}
          detalle={porcentaje(mes.margenBrutoPorcentual) ?? "Venta menos costo"}
        />
        <Kpi etiqueta="Gastos operativos" valor={formatearPesos(mes.gastosCentavos)} tono="malo" />
        <Kpi
          etiqueta="Resultado operativo"
          valor={formatearPesos(mes.resultadoOperativoCentavos)}
          tono={mes.resultadoOperativoCentavos >= 0 ? "bueno" : "malo"}
          detalle={porcentaje(mes.resultadoOperativoPorcentual)}
        />
        <Kpi
          etiqueta={`IIBB estimado${mes.alicuotaIIBB > 0 ? ` (${(mes.alicuotaIIBB / 100).toString().replace(".", ",")}%)` : ""}`}
          valor={formatearPesos(mes.iibbCentavos)}
          tono="malo"
          detalle={mes.alicuotaIIBB > 0 ? "Sobre ventas sin IVA" : "Alícuota en cero, se ajusta en Reportes"}
        />
        <Kpi
          etiqueta="Después de IIBB"
          valor={formatearPesos(mes.resultadoDespuesIIBBCentavos)}
          tono={mes.resultadoDespuesIIBBCentavos >= 0 ? "bueno" : "malo"}
          detalle={porcentaje(mes.resultadoDespuesIIBBPorcentual)}
        />
      </div>

      {/*
        * La caja va en su propia fila y separada de la rentabilidad a
        * propósito: tener plata disponible no es haber ganado. Buena parte de
        * ese saldo es el capital para reponer mercadería.
        */}
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
        <Kpi
          etiqueta="Plata disponible"
          valor={formatearPesos(caja.total)}
          tono={caja.total < 0 ? "malo" : "neutro"}
          detalle={
            anticipos.disponibleCentavos > 0
              ? `${formatearPesos(anticipos.disponibleCentavos)} son anticipos sin entregar`
              : `${formatearPesos(caja.efectivo)} en efectivo`
          }
        />
        <Kpi etiqueta="Te deben" valor={formatearPesos(aCobrar)} detalle={`${porCobrar.length} pedidos entregados`} />
        <Kpi etiqueta="Debés" valor={formatearPesos(aPagar)} tono={aPagar > 0 ? "malo" : "neutro"} />
        <Kpi
          etiqueta="Plata en stock"
          valor={formatearPesos(deposito.valorCosto)}
          detalle={`${deposito.unidades} unidades a costo`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
        <Kpi etiqueta="Pedidos abiertos" valor={String(abiertos.length)} detalle={`${preparando} en preparación`} />
        <Kpi etiqueta="Pedidos entregados" valor={String(mes.pedidosEntregados)} detalle="En el mes" />
        <Kpi
          etiqueta="Ticket promedio"
          valor={formatearPesos(kpis.ticketPromedioCentavos)}
          detalle={mes.pedidosEntregados > 0 ? `${kpis.unidadesPorPedido.toFixed(1).replace(".", ",")} unid. por pedido` : undefined}
        />
        <Kpi
          etiqueta="Margen por unidad"
          valor={formatearPesos(kpis.margenPorUnidadCentavos)}
          tono={kpis.margenPorUnidadCentavos >= 0 ? "bueno" : "malo"}
          detalle="Antes de gastos"
        />
      </div>

      {reponer.length > 0 && (
        <Link
          href="/deposito"
          className="block rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:border-amber-300"
        >
          <p className="text-sm font-medium text-amber-900">
            {reponer.length === 1 ? "Un producto se está por acabar" : `${reponer.length} productos se están por acabar`}
          </p>
          <p className="mt-0.5 text-xs text-amber-800">
            {reponer
              .slice(0, 3)
              .map((l) =>
                l.diasDeStock !== null
                  ? `${l.nombre}: ${l.diasDeStock} días de stock`
                  : `${l.nombre}: bajo el mínimo`,
              )
              .join(" · ")}
          </p>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
        <Kpi etiqueta="Comercios activos" valor={String(clientes.length)} />
        <Kpi etiqueta="Unidades del mes" valor={String(mes.unidades)} detalle="Entregadas" />
      </div>

      <Tarjeta
        titulo="Últimos pedidos"
        accion={
          <Link href="/comercial/pedidos" className="toque text-xs font-medium text-azul-700">
            Ver todos
          </Link>
        }
      >
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
              {pedidos.slice(0, 8).map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/comercial/pedidos/${p.id}`} className="font-medium text-azul-700">
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

      <Tarjeta
        titulo="Quién compró más este mes"
        accion={
          <Link href="/comercial/reportes" className="toque text-xs font-medium text-azul-700">
            Reportes
          </Link>
        }
      >
        {ranking.length === 0 ? (
          <Vacio>Sin entregas en el mes.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Comercio</Th>
                <Th alinear="right">Pedidos</Th>
                <Th alinear="right">Venta</Th>
                <Th alinear="right">Margen</Th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((c) => (
                <tr key={c.clienteId}>
                  <Td>
                    <Link href={`/comercial/clientes/${c.clienteId}`} className="text-azul-700">
                      {c.comercio}
                    </Link>
                  </Td>
                  <Td alinear="right">{c.pedidos}</Td>
                  <Td alinear="right">
                    <Plata centavos={c.ingresosCentavos} />
                  </Td>
                  <Td alinear="right">
                    <Plata centavos={c.margenCentavos} tono />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Tarjeta>

      {/*
       * El cierre vacía el sistema, así que en la pantalla de todos los días va
       * como acceso y no como botón: desde acá se mira el resumen del período,
       * y borrar sigue pidiendo escribir la palabra en la pantalla siguiente.
       */}
      <Tarjeta titulo="Cierre del período">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-suave">
            {ultimoCierre
              ? `El último cierre fue ${ultimoCierre.periodo}, el ${formatearFecha(ultimoCierre.hasta)}. Desde entonces se cargaron ${pedidos.length} ${pedidos.length === 1 ? "pedido" : "pedidos"}.`
              : `Todavía no cerraste ningún período. Llevás ${pedidos.length} ${pedidos.length === 1 ? "pedido" : "pedidos"} cargados.`}
          </p>
          <BotonLink href="/comercial/cierre" variante="secundario">
            Ver el resumen del período
          </BotonLink>
        </div>
        <p className="mt-3 text-xs text-suave">
          Guarda el comprobante de todo lo que se movió y deja el sistema en cero para empezar un mes nuevo. Nada se
          borra desde acá: en la pantalla siguiente se ve primero el resumen y hay que confirmar escribiendo.
        </p>
      </Tarjeta>
    </div>
  );
}

/** Un porcentaje sobre ventas, o nada si todavía no se vendió. */
function porcentaje(valor: number | null): string | undefined {
  const texto = formatearPorcentaje(valor);
  return texto === null ? undefined : `${texto} sobre ventas sin IVA`;
}
