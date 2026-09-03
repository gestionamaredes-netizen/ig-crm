import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { movimientosStock, pedidoItems, pedidos, productos } from "../db/schema";
import type { TipoMovimiento } from "../db/schema";
import { ahora, hoy, nuevoId } from "../formato";

export type Movimiento = typeof movimientosStock.$inferSelect;

export class ErrorStock extends Error {}

// Drizzle no exporta un tipo simple para la transacción sincrónica de SQLite.
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Ejecutor = typeof db | Tx;

export type DatosMovimiento = {
  productoId: string;
  tipo: TipoMovimiento;
  /** Con signo: positivo entra al depósito, negativo sale. */
  cantidad: number;
  motivo?: string;
  pedidoId?: string | null;
  compraId?: string | null;
  fecha?: string;
  registradoPor?: string;
};

/**
 * Único camino por el que cambia el stock del depósito: actualiza el saldo y
 * deja la fila que lo explica. Corre dentro de la transacción que lo llama.
 */
export async function moverStock(ejecutor: Ejecutor, datos: DatosMovimiento): Promise<number> {
  if (!Number.isInteger(datos.cantidad) || datos.cantidad === 0) {
    throw new ErrorStock("El movimiento tiene que ser una cantidad distinta de cero.");
  }

  const producto = await ejecutor.select().from(productos).where(eq(productos.id, datos.productoId)).get();
  if (!producto) throw new ErrorStock("El producto no existe.");

  const resultante = producto.stock + datos.cantidad;
  if (resultante < 0) {
    throw new ErrorStock(
      `No alcanza el stock de ${producto.nombre}: hay ${producto.stock} y estás sacando ${Math.abs(datos.cantidad)}.`,
    );
  }

  await ejecutor.update(productos).set({ stock: resultante }).where(eq(productos.id, producto.id)).run();
  ejecutor
    .insert(movimientosStock)
    .values({
      id: nuevoId(),
      productoId: producto.id,
      tipo: datos.tipo,
      cantidad: datos.cantidad,
      stockResultante: resultante,
      motivo: datos.motivo ?? "",
      pedidoId: datos.pedidoId ?? null,
      compraId: datos.compraId ?? null,
      fecha: datos.fecha ?? hoy(),
      registradoPor: datos.registradoPor ?? "Depósito",
      creadoEn: ahora(),
    })
    .run();

  return resultante;
}

/** Entrada de mercadería al depósito. */
export async function registrarEntrada(datos: {
  productoId: string;
  cantidad: number;
  motivo?: string;
  fecha?: string;
}): Promise<void> {
  if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0) {
    throw new ErrorStock("La cantidad que entra tiene que ser mayor a cero.");
  }
  await db.transaction(async (tx) =>
    await moverStock(tx, {
      productoId: datos.productoId,
      tipo: "entrada",
      cantidad: datos.cantidad,
      motivo: datos.motivo,
      fecha: datos.fecha,
    }),
  );
}

/**
 * Ajuste de inventario: rotura, faltante o corrección de conteo. La cantidad va
 * con signo porque el ajuste puede sumar o restar.
 */
export async function registrarAjuste(datos: {
  productoId: string;
  cantidad: number;
  motivo: string;
  fecha?: string;
}): Promise<void> {
  if (!datos.motivo.trim()) throw new ErrorStock("Un ajuste necesita un motivo: sin eso el historial no sirve.");
  await db.transaction(async (tx) =>
    await moverStock(tx, {
      productoId: datos.productoId,
      tipo: "ajuste",
      cantidad: datos.cantidad,
      motivo: datos.motivo.trim(),
      fecha: datos.fecha,
    }),
  );
}

export type MovimientoConProducto = Movimiento & { producto: string; numeroPedido: number | null };

export async function listarMovimientos(
  filtro: { productoId?: string; desde?: string; hasta?: string; limite?: number } = {},
): Promise<MovimientoConProducto[]> {
  const condiciones = [];
  if (filtro.productoId) condiciones.push(eq(movimientosStock.productoId, filtro.productoId));
  if (filtro.desde) condiciones.push(gte(movimientosStock.fecha, filtro.desde));
  if (filtro.hasta) condiciones.push(lte(movimientosStock.fecha, filtro.hasta));

  return db
    .select({
      id: movimientosStock.id,
      productoId: movimientosStock.productoId,
      tipo: movimientosStock.tipo,
      cantidad: movimientosStock.cantidad,
      stockResultante: movimientosStock.stockResultante,
      motivo: movimientosStock.motivo,
      pedidoId: movimientosStock.pedidoId,
      fecha: movimientosStock.fecha,
      registradoPor: movimientosStock.registradoPor,
      compraId: movimientosStock.compraId,
      creadoEn: movimientosStock.creadoEn,
      producto: productos.nombre,
      // El pedido puede haberse borrado: el movimiento igual queda en el libro.
      numeroPedido: pedidos.numero,
    })
    .from(movimientosStock)
    .innerJoin(productos, eq(productos.id, movimientosStock.productoId))
    .leftJoin(pedidos, eq(pedidos.id, movimientosStock.pedidoId))
    .where(condiciones.length ? and(...condiciones) : undefined)
    // creadoEn tiene precisión de milisegundo y una entrega de varios productos
    // graba todos sus movimientos dentro del mismo: sin desempatar por orden de
    // inserción, el libro los mostraría en cualquier orden.
    .orderBy(desc(movimientosStock.fecha), desc(movimientosStock.creadoEn), desc(sql`${movimientosStock}.rowid`))
    .limit(filtro.limite ?? 200)
    .all();
}

/**
 * Unidades ya vendidas pero todavía en el depósito, por estar en pedidos
 * pendientes o en preparación. Es lo que no hay que volver a prometer.
 */
export async function comprometidoPorProducto(): Promise<Map<string, number>> {
  const filas = await db
    .select({
      productoId: pedidoItems.productoId,
      cantidad: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
    })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidos.id, pedidoItems.pedidoId))
    .where(sql`${pedidos.estado} in ('pendiente', 'preparando')`)
    .groupBy(pedidoItems.productoId)
    .all();
  return new Map(filas.map((f) => [f.productoId, f.cantidad]));
}

export type LineaDeposito = {
  id: string;
  nombre: string;
  presentacion: string;
  stock: number;
  stockMinimo: number;
  comprometido: number;
  libre: number;
  costoCentavos: number;
  precioCentavos: number;
  activo: boolean;
  bajoMinimo: boolean;
};

/** Foto del depósito: saldo, comprometido y libre por producto. */
export async function estadoDeposito(soloActivos = true): Promise<LineaDeposito[]> {
  const comprometido = await comprometidoPorProducto();
  const filas = await db
    .select()
    .from(productos)
    .where(soloActivos ? eq(productos.activo, true) : undefined)
    .orderBy(asc(productos.nombre))
    .all();

  return filas.map((p) => {
    const reservado = comprometido.get(p.id) ?? 0;
    return {
      id: p.id,
      nombre: p.nombre,
      presentacion: p.presentacion,
      stock: p.stock,
      stockMinimo: p.stockMinimo,
      comprometido: reservado,
      libre: p.stock - reservado,
      costoCentavos: p.costoCentavos,
      precioCentavos: p.precioCentavos,
      activo: p.activo,
      // El mínimo se mide contra lo libre: lo comprometido ya tiene dueño.
      bajoMinimo: p.stockMinimo > 0 && p.stock - reservado <= p.stockMinimo,
    };
  });
}

export async function resumenDeposito() {
  const lineas = await estadoDeposito();
  return {
    lineas,
    unidades: lineas.reduce((acc, l) => acc + l.stock, 0),
    comprometido: lineas.reduce((acc, l) => acc + l.comprometido, 0),
    libre: lineas.reduce((acc, l) => acc + l.libre, 0),
    valorCosto: lineas.reduce((acc, l) => acc + l.stock * l.costoCentavos, 0),
    valorVenta: lineas.reduce((acc, l) => acc + l.stock * l.precioCentavos, 0),
    aReponer: lineas.filter((l) => l.bajoMinimo),
  };
}
