import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "../db";
import { compraVinculos, movimientosStock, pedidoItems, pedidos, productos } from "../db/schema";
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
  /** Id del movimiento que esta fila deshace, si es una corrección. */
  revierteA?: string | null;
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
      revierteA: datos.revierteA ?? null,
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

/**
 * Deshace un movimiento del depósito escribiendo el contrario, no borrándolo.
 *
 * El libro es la explicación del saldo: si una fila desaparece, el stock deja
 * de poder justificarse. Así que una corrección agrega un ajuste que apunta al
 * movimiento que corrige, y los dos quedan a la vista.
 *
 * Solo se deshacen los movimientos cargados a mano. Los que nacieron de una
 * compra o de una entrega se deshacen desde ahí: si no, la compra seguiría
 * diciendo que entró mercadería que ya no está en ningún lado.
 */
export async function revertirMovimiento(datos: {
  movimientoId: string;
  motivo: string;
  registradoPor?: string;
  fecha?: string;
}): Promise<void> {
  const razon = datos.motivo.trim();
  if (!razon) throw new ErrorStock("Una corrección necesita un motivo: sin eso el historial no sirve.");

  await db.transaction(async (tx) => {
    const original = await tx
      .select()
      .from(movimientosStock)
      .where(eq(movimientosStock.id, datos.movimientoId))
      .get();
    if (!original) throw new ErrorStock("Ese movimiento no existe.");

    if (original.compraId) {
      throw new ErrorStock("Este movimiento vino de una compra: anulá la compra y la mercadería vuelve sola.");
    }
    if (original.pedidoId) {
      throw new ErrorStock("Este movimiento vino de un pedido: cambiale el estado al pedido y el stock vuelve solo.");
    }
    if (original.revierteA) {
      throw new ErrorStock("Este movimiento ya es la corrección de otro. Si está mal, corregí el original.");
    }

    const yaRevertido = await tx
      .select({ id: movimientosStock.id })
      .from(movimientosStock)
      .where(eq(movimientosStock.revierteA, original.id))
      .get();
    if (yaRevertido) throw new ErrorStock("Este movimiento ya fue corregido antes.");

    // Si esas unidades ya tienen factura, deshacerlas dejaría la compra
    // vinculada a mercadería que no existe.
    const vinculo = await tx
      .select({ id: compraVinculos.id })
      .from(compraVinculos)
      .where(eq(compraVinculos.movimientoId, original.id))
      .get();
    if (vinculo) {
      throw new ErrorStock(
        "Estas unidades están vinculadas a una compra. Desvinculalas primero desde la compra y después corregí.",
      );
    }

    await moverStock(tx, {
      productoId: original.productoId,
      tipo: "ajuste",
      cantidad: -original.cantidad,
      motivo: `Corrección: ${razon}`,
      fecha: datos.fecha ?? hoy(),
      registradoPor: datos.registradoPor ?? "Depósito",
      revierteA: original.id,
    });
  });
}

export type MovimientoConProducto = Movimiento & {
  producto: string;
  numeroPedido: number | null;
  /** Si ya existe el ajuste que lo deshace. No se puede corregir dos veces. */
  corregido: boolean;
  /** Si estas unidades ya están amparadas por una compra vinculada. */
  conFactura: boolean;
};

export async function listarMovimientos(
  filtro: { productoId?: string; desde?: string; hasta?: string; limite?: number } = {},
): Promise<MovimientoConProducto[]> {
  const condiciones = [];
  if (filtro.productoId) condiciones.push(eq(movimientosStock.productoId, filtro.productoId));
  if (filtro.desde) condiciones.push(gte(movimientosStock.fecha, filtro.desde));
  if (filtro.hasta) condiciones.push(lte(movimientosStock.fecha, filtro.hasta));

  // Autounión para saber si alguien ya escribió el ajuste que deshace esta
  // fila: sin eso la pantalla ofrecería corregir algo que ya está corregido.
  const correccion = alias(movimientosStock, "correccion");

  const filas = await db
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
      revierteA: movimientosStock.revierteA,
      creadoEn: movimientosStock.creadoEn,
      producto: productos.nombre,
      // El pedido puede haberse borrado: el movimiento igual queda en el libro.
      numeroPedido: pedidos.numero,
      corregidoPor: correccion.id,
      vinculos: sql<number>`count(${compraVinculos.id})`,
    })
    .from(movimientosStock)
    .innerJoin(productos, eq(productos.id, movimientosStock.productoId))
    .leftJoin(pedidos, eq(pedidos.id, movimientosStock.pedidoId))
    .leftJoin(correccion, eq(correccion.revierteA, movimientosStock.id))
    .leftJoin(compraVinculos, eq(compraVinculos.movimientoId, movimientosStock.id))
    .where(condiciones.length ? and(...condiciones) : undefined)
    // creadoEn tiene precisión de milisegundo y una entrega de varios productos
    // graba todos sus movimientos dentro del mismo: sin desempatar por orden de
    // inserción, el libro los mostraría en cualquier orden.
    // Agrupa por el movimiento porque un mismo renglón puede tener varios
    // vínculos de compra: sin esto aparecería repetido una vez por cada uno.
    .groupBy(movimientosStock.id)
    .orderBy(desc(movimientosStock.fecha), desc(movimientosStock.creadoEn), desc(sql`${movimientosStock}.rowid`))
    .limit(filtro.limite ?? 200)
    .all();

  return filas.map(({ corregidoPor, vinculos, ...f }) => ({
    ...f,
    corregido: corregidoPor !== null,
    conFactura: vinculos > 0,
  }));
}

/**
 * Un movimiento se puede deshacer solo si lo cargó alguien a mano y nadie lo
 * deshizo todavía. Los que vienen de una compra o de un pedido se arreglan
 * desde ahí; las correcciones no se corrigen; y las unidades que ya tienen
 * factura vinculada hay que desvincularlas primero, o la compra quedaría
 * amparando mercadería que dejó de existir.
 */
export function sePuedeRevertir(
  m: Pick<MovimientoConProducto, "pedidoId" | "compraId" | "revierteA" | "corregido" | "conFactura">,
): boolean {
  return !m.pedidoId && !m.compraId && !m.revierteA && !m.corregido && !m.conFactura;
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
  unidadesPorBulto: number;
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
      unidadesPorBulto: p.unidadesPorBulto,
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
