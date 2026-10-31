import "server-only";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { categoriasGasto, clientes, gastos, pedidoItems, pedidos, productos } from "../db/schema";
import { leerNumero, preciosConIva } from "./config";

export type Rango = { desde: string; hasta: string };

export type Cascada = {
  /** Lo facturado, tal como figura en los pedidos. Puede llevar IVA adentro. */
  ventaBrutaCentavos: number;
  /** Sin IVA. Es la base de todos los porcentajes y de Ingresos Brutos. */
  ventaNetaCentavos: number;
  ivaDebitoCentavos: number;
  costoCentavos: number;
  margenBrutoCentavos: number;
  margenBrutoPorcentual: number | null;
  gastosOperativosCentavos: number;
  resultadoOperativoCentavos: number;
  resultadoOperativoPorcentual: number | null;
  alicuotaIIBB: number;
  iibbCentavos: number;
  resultadoDespuesIIBBCentavos: number;
  resultadoDespuesIIBBPorcentual: number | null;
};

/**
 * De lo que se facturó a lo que queda, en pasos y en un solo lugar.
 *
 * Todo se mide sobre la venta **sin IVA**. El IVA no es ingreso de Aqua Mar:
 * se le cobra al comercio y se le entrega a AFIP. Mezclarlo infla el margen en
 * una quinta parte de las ventas y hace parecer rentable algo que no lo es.
 *
 * El costo entra como quedó congelado en cada pedido. Para un Responsable
 * Inscripto no lleva IVA, porque es crédito fiscal y no costo; para un
 * monotributista sí, porque no lo recupera. Esa decisión ya está tomada al
 * confirmar la compra, así que acá no se vuelve a tocar.
 *
 * Ingresos Brutos se estima sobre la venta neta. Es un impuesto sobre la
 * facturación, no sobre la ganancia: se paga igual aunque el mes cierre en
 * pérdida, y por eso va después del resultado operativo y no entre los gastos.
 *
 * Es una función pura para poder probar la aritmética sin base de datos.
 */
export function calcularCascada(entrada: {
  ventaBrutaCentavos: number;
  ventaNetaCentavos: number;
  costoCentavos: number;
  gastosOperativosCentavos: number;
  alicuotaIIBB: number;
}): Cascada {
  const base = entrada.ventaNetaCentavos;
  const sobreVentas = (x: number) => (base > 0 ? (x / base) * 100 : null);

  const margenBruto = base - entrada.costoCentavos;
  const resultadoOperativo = margenBruto - entrada.gastosOperativosCentavos;
  const iibb = entrada.alicuotaIIBB > 0 ? Math.round((base * entrada.alicuotaIIBB) / 10000) : 0;
  const despuesIIBB = resultadoOperativo - iibb;

  return {
    ventaBrutaCentavos: entrada.ventaBrutaCentavos,
    ventaNetaCentavos: base,
    ivaDebitoCentavos: entrada.ventaBrutaCentavos - base,
    costoCentavos: entrada.costoCentavos,
    margenBrutoCentavos: margenBruto,
    margenBrutoPorcentual: sobreVentas(margenBruto),
    gastosOperativosCentavos: entrada.gastosOperativosCentavos,
    resultadoOperativoCentavos: resultadoOperativo,
    resultadoOperativoPorcentual: sobreVentas(resultadoOperativo),
    alicuotaIIBB: entrada.alicuotaIIBB,
    iibbCentavos: iibb,
    resultadoDespuesIIBBCentavos: despuesIIBB,
    resultadoDespuesIIBBPorcentual: sobreVentas(despuesIIBB),
  };
}

/**
 * Cómo pasar de lo facturado a la venta sin IVA, con la configuración del
 * negocio. Se calcula una vez y se aplica a cada fila: si los márgenes por
 * cliente o por producto se midieran contra lo facturado, dirían una cosa
 * distinta del margen del período y nadie sabría a cuál creerle.
 */
async function conversorANeto(): Promise<(bruto: number) => number> {
  const conIva = await preciosConIva();
  if (!conIva) return (bruto) => bruto;
  const alicuota = await leerNumero("alicuotaVentas");
  return (bruto) => Math.round(bruto / (1 + alicuota / 10000));
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

  const bruta = venta?.ingresosCentavos ?? 0;
  const costoCentavos = venta?.costoCentavos ?? 0;

  // Si los precios de la lista ya llevan el IVA adentro hay que sacarlo de
  // adentro del importe; si no, lo facturado ya es el neto.
  const alicuotaVentas = await leerNumero("alicuotaVentas");
  const conIva = await preciosConIva();
  const neta = conIva ? Math.round(bruta / (1 + alicuotaVentas / 10000)) : bruta;

  const porTipo = (t: string) => gastosPorTipo.find((g) => g.tipo === t)?.total ?? 0;
  const gastosOperativos = porTipo("operativo");
  const gastosLogisticos = porTipo("logistico");
  // Los impuestos ya pagados no bajan el resultado operativo: Ingresos Brutos
  // ya se descuenta estimado sobre las ventas, y restar además su pago sería
  // contarlo dos veces. Se muestran aparte, porque la plata sí salió.
  const impuestosPagados = porTipo("impuesto");
  const gastosCentavos = gastosOperativos + gastosLogisticos;

  return {
    rango,
    /** Lo facturado, con IVA adentro si la lista trabaja así. */
    ingresosCentavos: bruta,
    unidades: venta?.unidades ?? 0,
    gastosCentavos,
    gastosOperativos,
    gastosLogisticos,
    impuestosPagadosCentavos: impuestosPagados,
    gastosImputadosAPedidos: gastosImputados?.total ?? 0,
    pedidosEntregados: pedidosEntregados?.n ?? 0,
    pedidosAbiertos: pedidosPendientes?.n ?? 0,
    ...calcularCascada({
      ventaBrutaCentavos: bruta,
      ventaNetaCentavos: neta,
      costoCentavos,
      gastosOperativosCentavos: gastosCentavos,
      alicuotaIIBB: await leerNumero("alicuotaIIBB"),
    }),
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
  const aNeto = await conversorANeto();

  return filas.map((f) => {
    const gastosCentavos = porPedido.get(f.id) ?? 0;
    const ventaNetaCentavos = aNeto(f.ingresosCentavos);
    return {
      ...f,
      ventaNetaCentavos,
      gastosCentavos,
      margenCentavos: ventaNetaCentavos - f.costoCentavos - gastosCentavos,
    };
  });
}

export async function rentabilidadPorProducto(rango: Rango) {
  const aNeto = await conversorANeto();
  const filas = await db
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

  return filas.map((f) => {
    const ventaNetaCentavos = aNeto(f.ingresosCentavos);
    return { ...f, ventaNetaCentavos, margenCentavos: ventaNetaCentavos - f.costoCentavos };
  });
}

export async function rentabilidadPorCliente(rango: Rango) {
  const aNeto = await conversorANeto();
  const filas = await db
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

  return filas.map((f) => {
    const ventaNetaCentavos = aNeto(f.ingresosCentavos);
    return { ...f, ventaNetaCentavos, margenCentavos: ventaNetaCentavos - f.costoCentavos };
  });
}

/**
 * Los números que se miran de un vistazo: cuánto se vendió por pedido, cuánto
 * deja cada bulto. Salen del mismo resumen para que no puedan contradecirlo.
 */
export function indicadores(r: {
  ventaNetaCentavos: number;
  margenBrutoCentavos: number;
  resultadoDespuesIIBBCentavos: number;
  unidades: number;
  pedidosEntregados: number;
}) {
  return {
    ticketPromedioCentavos: r.pedidosEntregados > 0 ? Math.round(r.ventaNetaCentavos / r.pedidosEntregados) : 0,
    unidadesPorPedido: r.pedidosEntregados > 0 ? r.unidades / r.pedidosEntregados : 0,
    margenPorUnidadCentavos: r.unidades > 0 ? Math.round(r.margenBrutoCentavos / r.unidades) : 0,
    netoPorUnidadCentavos: r.unidades > 0 ? Math.round(r.resultadoDespuesIIBBCentavos / r.unidades) : 0,
  };
}

/**
 * Productos que no se movieron en el período pero siguen ocupando plata en el
 * depósito. Es el capital que está quieto.
 */
export async function bajaRotacion(rango: Rango) {
  const vendidos = await db
    .select({
      productoId: pedidoItems.productoId,
      unidades: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
    })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidos.id, pedidoItems.pedidoId))
    .where(entregadoEnRango(rango))
    .groupBy(pedidoItems.productoId)
    .all();
  const porProducto = new Map(vendidos.map((v) => [v.productoId, v.unidades]));

  const catalogo = await db.select().from(productos).where(eq(productos.activo, true)).all();

  return catalogo
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      stock: p.stock,
      unidadesVendidas: porProducto.get(p.id) ?? 0,
      capitalQuietoCentavos: p.stock * p.costoCentavos,
    }))
    .filter((p) => p.unidadesVendidas === 0 && p.stock > 0)
    .sort((a, b) => b.capitalQuietoCentavos - a.capitalQuietoCentavos);
}
