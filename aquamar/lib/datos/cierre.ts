import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  bitacora,
  cierres,
  clientes,
  compraItems,
  compras,
  escalasPrecio,
  gastos,
  movimientosCaja,
  movimientosStock,
  pagosComision,
  pedidoItems,
  pedidos,
  productos,
  vendedores,
  ventasCliente,
} from "../db/schema";
import { ahora, hoy, nuevoId } from "../formato";

export type Cierre = typeof cierres.$inferSelect;

export class ErrorCierre extends Error {}

export type ResumenCierre = {
  desde: string;
  hasta: string;
  productos: {
    nombre: string;
    presentacion: string;
    unidadesPorBulto: number;
    stockFinal: number;
    entradas: number;
    salidas: number;
    ajustes: number;
    costoCentavos: number;
    precioCentavos: number;
  }[];
  pedidos: { total: number; entregados: number; unidades: number; facturadoCentavos: number; cobradoCentavos: number };
  compras: { total: number; confirmadas: number; totalCentavos: number; pagadoCentavos: number };
  caja: { ingresosCentavos: number; egresosCentavos: number; efectivoCentavos: number; bancoCentavos: number };
  deudas: { comercios: number; totalCentavos: number };
  comisiones: { vendedor: string; ganadoCentavos: number; pagadoCentavos: number; saldoCentavos: number }[];
  gastosCentavos: number;
  comercios: number;
};

/**
 * La foto del período antes de vaciarlo: qué se movió, cuánto quedó y a quién
 * se le debe qué.
 *
 * Se puede mirar todas las veces que haga falta sin tocar nada. El cierre la
 * calcula de nuevo en el momento de ejecutarse, así lo que se guarda es lo que
 * había un segundo antes de borrar, y no lo que se vio en pantalla hace un rato.
 */
export async function resumenDelPeriodo(): Promise<ResumenCierre> {
  const desdeFila = await db
    .select({ f: sql<string>`min(${movimientosStock.fecha})` })
    .from(movimientosStock)
    .get();

  const catalogo = await db.select().from(productos).orderBy(asc(productos.nombre)).all();

  const porProducto = await db
    .select({
      productoId: movimientosStock.productoId,
      entradas: sql<number>`coalesce(sum(case when ${movimientosStock.tipo} = 'entrada' then ${movimientosStock.cantidad} else 0 end), 0)`,
      salidas: sql<number>`coalesce(sum(case when ${movimientosStock.tipo} = 'salida' then -${movimientosStock.cantidad} else 0 end), 0)`,
      ajustes: sql<number>`coalesce(sum(case when ${movimientosStock.tipo} in ('ajuste', 'devolucion') then ${movimientosStock.cantidad} else 0 end), 0)`,
    })
    .from(movimientosStock)
    .groupBy(movimientosStock.productoId)
    .all();
  const movs = new Map(porProducto.map((m) => [m.productoId, m]));

  const dePedidos = await db
    .select({
      total: sql<number>`count(*)`,
      entregados: sql<number>`coalesce(sum(case when ${pedidos.estado} = 'entregado' then 1 else 0 end), 0)`,
      cobrado: sql<number>`coalesce(sum(${pedidos.cobradoCentavos}), 0)`,
    })
    .from(pedidos)
    .get();

  const facturado = await db
    .select({
      unidades: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
      total: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
    })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidos.id, pedidoItems.pedidoId))
    .where(eq(pedidos.estado, "entregado"))
    .get();

  const deCompras = await db
    .select({
      total: sql<number>`count(*)`,
      confirmadas: sql<number>`coalesce(sum(case when ${compras.estado} = 'confirmada' then 1 else 0 end), 0)`,
      totalCentavos: sql<number>`coalesce(sum(case when ${compras.estado} = 'confirmada' then ${compras.totalCentavos} else 0 end), 0)`,
      pagado: sql<number>`coalesce(sum(${compras.pagadoCentavos}), 0)`,
    })
    .from(compras)
    .get();

  const deCaja = await db
    .select({
      ingresos: sql<number>`coalesce(sum(case when ${movimientosCaja.montoCentavos} > 0 then ${movimientosCaja.montoCentavos} else 0 end), 0)`,
      egresos: sql<number>`coalesce(sum(case when ${movimientosCaja.montoCentavos} < 0 then -${movimientosCaja.montoCentavos} else 0 end), 0)`,
      efectivo: sql<number>`coalesce(sum(case when ${movimientosCaja.medio} = 'efectivo' then ${movimientosCaja.montoCentavos} else 0 end), 0)`,
      banco: sql<number>`coalesce(sum(case when ${movimientosCaja.medio} = 'banco' then ${movimientosCaja.montoCentavos} else 0 end), 0)`,
    })
    .from(movimientosCaja)
    .get();

  // Lo que quedó debiendo cada comercio: solo cuenta lo entregado.
  const deuda = await db.all<{ comercios: number; total: number }>(sql`
    select count(*) as comercios, coalesce(sum(saldo), 0) as total from (
      select p.id,
             (select coalesce(sum(i.cantidad * i.precio_unit_centavos), 0)
                from pedido_items i where i.pedido_id = p.id) - p.cobrado_centavos as saldo
        from pedidos p
       where p.estado = 'entregado'
    ) where saldo > 0
  `);

  const equipo = await db.select().from(vendedores).orderBy(asc(vendedores.nombre)).all();
  const ganado = await db
    .select({ vendedorId: pedidos.vendedorId, total: sql<number>`coalesce(sum(${pedidos.comisionCentavos}), 0)` })
    .from(pedidos)
    .where(eq(pedidos.estado, "entregado"))
    .groupBy(pedidos.vendedorId)
    .all();
  const pagado = await db
    .select({ vendedorId: pagosComision.vendedorId, total: sql<number>`coalesce(sum(${pagosComision.montoCentavos}), 0)` })
    .from(pagosComision)
    .groupBy(pagosComision.vendedorId)
    .all();
  const porGanado = new Map(ganado.map((g) => [g.vendedorId ?? "", g.total]));
  const porPagado = new Map(pagado.map((g) => [g.vendedorId, g.total]));

  const deGastos = await db
    .select({ total: sql<number>`coalesce(sum(${gastos.montoCentavos}), 0)` })
    .from(gastos)
    .get();

  const cuantosComercios = await db
    .select({ n: sql<number>`count(*)` })
    .from(clientes)
    .where(eq(clientes.activo, true))
    .get();

  return {
    desde: desdeFila?.f ?? hoy(),
    hasta: hoy(),
    productos: catalogo.map((p) => ({
      nombre: p.nombre,
      presentacion: p.presentacion,
      unidadesPorBulto: p.unidadesPorBulto,
      stockFinal: p.stock,
      entradas: movs.get(p.id)?.entradas ?? 0,
      salidas: movs.get(p.id)?.salidas ?? 0,
      ajustes: movs.get(p.id)?.ajustes ?? 0,
      costoCentavos: p.costoCentavos,
      precioCentavos: p.precioCentavos,
    })),
    pedidos: {
      total: dePedidos?.total ?? 0,
      entregados: dePedidos?.entregados ?? 0,
      unidades: facturado?.unidades ?? 0,
      facturadoCentavos: facturado?.total ?? 0,
      cobradoCentavos: dePedidos?.cobrado ?? 0,
    },
    compras: {
      total: deCompras?.total ?? 0,
      confirmadas: deCompras?.confirmadas ?? 0,
      totalCentavos: deCompras?.totalCentavos ?? 0,
      pagadoCentavos: deCompras?.pagado ?? 0,
    },
    caja: {
      ingresosCentavos: deCaja?.ingresos ?? 0,
      egresosCentavos: deCaja?.egresos ?? 0,
      efectivoCentavos: deCaja?.efectivo ?? 0,
      bancoCentavos: deCaja?.banco ?? 0,
    },
    deudas: { comercios: deuda[0]?.comercios ?? 0, totalCentavos: deuda[0]?.total ?? 0 },
    comisiones: equipo
      .map((v) => {
        const g = porGanado.get(v.id) ?? 0;
        const pg = porPagado.get(v.id) ?? 0;
        return { vendedor: v.nombre, ganadoCentavos: g, pagadoCentavos: pg, saldoCentavos: g - pg };
      })
      .filter((c) => c.ganadoCentavos > 0 || c.pagadoCentavos > 0),
    gastosCentavos: deGastos?.total ?? 0,
    comercios: cuantosComercios?.n ?? 0,
  };
}

export const PALABRA_DE_CONFIRMACION = "CERRAR";

/**
 * Cierra el período: guarda la foto y deja el sistema listo para empezar de
 * nuevo.
 *
 * Borra el historial —movimientos de stock, pedidos, compras, caja, gastos,
 * ventas de los comercios y pagos de comisión— y pone en cero el stock, los
 * costos y los precios. Las fichas quedan: los comercios con sus links, los
 * productos con su nombre y sus bultos, los vendedores con su comisión.
 *
 * Todo pasa dentro de una sola transacción: o queda el cierre guardado y el
 * sistema limpio, o no cambia nada. Un cierre a medias sería lo peor que podría
 * pasar acá.
 *
 * Lo que NO se toca nunca es la bitácora: es el registro de quién hizo qué, y
 * un borrado masivo es justamente el momento en que más importa que esté.
 */
export async function cerrarPeriodo(datos: {
  periodo: string;
  hechoPor: string;
  nota?: string;
  confirmacion: string;
}): Promise<{ id: string; resumen: ResumenCierre }> {
  const periodo = datos.periodo.trim();
  if (!periodo) throw new ErrorCierre("Ponele un nombre al período que estás cerrando.");
  if (datos.confirmacion.trim().toUpperCase() !== PALABRA_DE_CONFIRMACION) {
    throw new ErrorCierre(`Para confirmar, escribí ${PALABRA_DE_CONFIRMACION} en el casillero.`);
  }

  const resumen = await resumenDelPeriodo();
  const id = nuevoId();

  await db.transaction(async (tx) => {
    await tx
      .insert(cierres)
      .values({
        id,
        periodo,
        desde: resumen.desde,
        hasta: resumen.hasta,
        hechoPor: datos.hechoPor,
        nota: datos.nota?.trim() ?? "",
        resumen: JSON.stringify(resumen),
        creadoEn: ahora(),
      })
      .run();

    // El historial. Los renglones salen con su cabecera por la clave foránea,
    // pero se borran a mano para no depender de que esté activada.
    await tx.delete(pedidoItems).run();
    await tx.delete(pedidos).run();
    await tx.delete(compraItems).run();
    await tx.delete(compras).run();
    await tx.delete(movimientosStock).run();
    await tx.delete(movimientosCaja).run();
    await tx.delete(gastos).run();
    await tx.delete(ventasCliente).run();
    await tx.delete(pagosComision).run();
    // Las listas quedan; sus escalas no, porque tenían los precios viejos.
    await tx.delete(escalasPrecio).run();

    await tx
      .update(productos)
      .set({ stock: 0, costoCentavos: 0, ultimoCostoCentavos: 0, precioCentavos: 0 })
      .run();
  });

  return { id, resumen };
}

export async function listarCierres(): Promise<Cierre[]> {
  return db.select().from(cierres).orderBy(desc(cierres.creadoEn)).all();
}

export async function obtenerCierre(id: string): Promise<(Cierre & { datos: ResumenCierre }) | undefined> {
  const fila = await db.select().from(cierres).where(eq(cierres.id, id)).get();
  if (!fila) return undefined;
  return { ...fila, datos: JSON.parse(fila.resumen) as ResumenCierre };
}

/** Si hay productos sin precio: después de un cierre, vender sería vender a cero. */
export async function faltanPrecios(): Promise<number> {
  const fila = await db
    .select({ n: sql<number>`count(*)` })
    .from(productos)
    .where(sql`${productos.activo} = 1 and ${productos.precioCentavos} = 0`)
    .get();
  return fila?.n ?? 0;
}

/** Última anotación de la bitácora, para el pie del comprobante. */
export async function ultimoRegistro(): Promise<string> {
  const fila = await db.select().from(bitacora).orderBy(desc(bitacora.creadoEn)).limit(1).get();
  return fila?.creadoEn ?? "";
}
