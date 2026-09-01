import "server-only";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { categoriasGasto, clientes, gastos, pedidoItems, pedidos, productos } from "../db/schema";

export type Rango = { desde: string; hasta: string };

/**
 * La rentabilidad de un período: margen de la mercadería entregada menos todo
 * lo que se gastó en ese mismo período (operativo y logístico).
 */
export function calcularResultado(entrada: {
  ingresosCentavos: number;
  costoCentavos: number;
  gastosCentavos: number;
}) {
  const margenBruto = entrada.ingresosCentavos - entrada.costoCentavos;
  const neto = margenBruto - entrada.gastosCentavos;
  const margenPorcentual = entrada.ingresosCentavos > 0 ? (margenBruto / entrada.ingresosCentavos) * 100 : null;
  const netoPorcentual = entrada.ingresosCentavos > 0 ? (neto / entrada.ingresosCentavos) * 100 : null;
  return { margenBruto, neto, margenPorcentual, netoPorcentual };
}

const entregadoEnRango = (r: Rango) =>
  and(eq(pedidos.estado, "entregado"), gte(pedidos.fecha, r.desde), lte(pedidos.fecha, r.hasta));

export async function resumen(rango: Rango) {
  const venta = await db
    .select({
      ingresosCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
      costoCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.costoUnitCentavos}), 0)`,
      unidades: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
    })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidos.id, pedidoItems.pedidoId))
    .where(entregadoEnRango(rango))
    .get();

  const pedidosEntregados = await db
    .select({ n: sql<number>`count(*)` })
    .from(pedidos)
    .where(entregadoEnRango(rango))
    .get();

  const pedidosPendientes = await db
    .select({ n: sql<number>`count(*)` })
    .from(pedidos)
    .where(sql`${pedidos.estado} in ('pendiente', 'preparando')`)
    .get();

  const gastosPorTipo = await db
    .select({
      tipo: categoriasGasto.tipo,
      total: sql<number>`coalesce(sum(${gastos.montoCentavos}), 0)`,
    })
    .from(gastos)
    .innerJoin(categoriasGasto, eq(categoriasGasto.id, gastos.categoriaId))
    .where(and(gte(gastos.fecha, rango.desde), lte(gastos.fecha, rango.hasta)))
    .groupBy(categoriasGasto.tipo)
    .all();

  const gastosImputados = await db
    .select({ total: sql<number>`coalesce(sum(${gastos.montoCentavos}), 0)` })
    .from(gastos)
    .where(and(gte(gastos.fecha, rango.desde), lte(gastos.fecha, rango.hasta), sql`${gastos.pedidoId} is not null`))
    .get();

  const ingresosCentavos = venta?.ingresosCentavos ?? 0;
  const costoCentavos = venta?.costoCentavos ?? 0;
  const gastosCentavos = gastosPorTipo.reduce((acc, g) => acc + g.total, 0);

  return {
    rango,
    ingresosCentavos,
    costoCentavos,
    unidades: venta?.unidades ?? 0,
    gastosCentavos,
    gastosOperativos: gastosPorTipo.find((g) => g.tipo === "operativo")?.total ?? 0,
    gastosLogisticos: gastosPorTipo.find((g) => g.tipo === "logistico")?.total ?? 0,
    gastosImputadosAPedidos: gastosImputados?.total ?? 0,
    pedidosEntregados: pedidosEntregados?.n ?? 0,
    pedidosAbiertos: pedidosPendientes?.n ?? 0,
    ...calcularResultado({ ingresosCentavos, costoCentavos, gastosCentavos }),
  };
}

export async function gastosPorCategoria(rango: Rango) {
  return db
    .select({
      categoria: categoriasGasto.nombre,
      tipo: categoriasGasto.tipo,
      total: sql<number>`coalesce(sum(${gastos.montoCentavos}), 0)`,
    })
    .from(gastos)
    .innerJoin(categoriasGasto, eq(categoriasGasto.id, gastos.categoriaId))
    .where(and(gte(gastos.fecha, rango.desde), lte(gastos.fecha, rango.hasta)))
    .groupBy(categoriasGasto.id)
    .orderBy(desc(sql`sum(${gastos.montoCentavos})`))
    .all();
}

/** Rentabilidad pedido por pedido, con los gastos logísticos imputados a cada uno. */
export async function rentabilidadPorPedido(rango: Rango) {
  const filas = await db
    .select({
      id: pedidos.id,
      numero: pedidos.numero,
      fecha: pedidos.fecha,
      comercio: clientes.comercio,
      ingresosCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
      costoCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.costoUnitCentavos}), 0)`,
    })
    .from(pedidos)
    .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
    .leftJoin(pedidoItems, eq(pedidoItems.pedidoId, pedidos.id))
    .where(entregadoEnRango(rango))
    .groupBy(pedidos.id)
    .orderBy(desc(pedidos.fecha))
    .all();

  const imputados = await db
    .select({
      pedidoId: gastos.pedidoId,
      total: sql<number>`coalesce(sum(${gastos.montoCentavos}), 0)`,
    })
    .from(gastos)
    .where(sql`${gastos.pedidoId} is not null`)
    .groupBy(gastos.pedidoId)
    .all();
  const porPedido = new Map(imputados.map((g) => [g.pedidoId as string, g.total]));

  return filas.map((f) => {
    const gastosCentavos = porPedido.get(f.id) ?? 0;
    return {
      ...f,
      gastosCentavos,
      margenCentavos: f.ingresosCentavos - f.costoCentavos - gastosCentavos,
    };
  });
}

export async function rentabilidadPorProducto(rango: Rango) {
  return db
    .select({
      productoId: productos.id,
      nombre: productos.nombre,
      unidades: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
      ingresosCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
      costoCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.costoUnitCentavos}), 0)`,
    })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidos.id, pedidoItems.pedidoId))
    .innerJoin(productos, eq(productos.id, pedidoItems.productoId))
    .where(entregadoEnRango(rango))
    .groupBy(productos.id)
    .orderBy(desc(sql`sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos})`))
    .all();
}

export async function rentabilidadPorCliente(rango: Rango) {
  return db
    .select({
      clienteId: clientes.id,
      comercio: clientes.comercio,
      pedidos: sql<number>`count(distinct ${pedidos.id})`,
      ingresosCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
      costoCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.costoUnitCentavos}), 0)`,
    })
    .from(pedidos)
    .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
    .leftJoin(pedidoItems, eq(pedidoItems.pedidoId, pedidos.id))
    .where(entregadoEnRango(rango))
    .groupBy(clientes.id)
    .orderBy(desc(sql`sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos})`))
    .all();
}
