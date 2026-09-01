import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { pedidoItems, pedidos, productos, ventasCliente } from "../db/schema";
import { ahora, nuevoId } from "../formato";

export type VentaCliente = typeof ventasCliente.$inferSelect;

export type LineaStock = {
  productoId: string;
  nombre: string;
  presentacion: string;
  recibido: number;
  vendido: number;
  disponible: number;
  precioCentavos: number;
};

export class ErrorPanel extends Error {}

/**
 * Stock del comercio: lo que le entregamos menos lo que declaró vendido.
 * Se calcula, no se guarda, para que no pueda desincronizarse de las entregas.
 */
export function stockDelCliente(clienteId: string): LineaStock[] {
  const recibidos = db
    .select({
      productoId: pedidoItems.productoId,
      nombre: productos.nombre,
      presentacion: productos.presentacion,
      precioCentavos: productos.precioCentavos,
      recibido: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
    })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidos.id, pedidoItems.pedidoId))
    .innerJoin(productos, eq(productos.id, pedidoItems.productoId))
    .where(sql`${pedidos.clienteId} = ${clienteId} and ${pedidos.estado} = 'entregado'`)
    .groupBy(pedidoItems.productoId)
    .all();

  const vendidos = db
    .select({
      productoId: ventasCliente.productoId,
      vendido: sql<number>`coalesce(sum(${ventasCliente.cantidad}), 0)`,
    })
    .from(ventasCliente)
    .where(eq(ventasCliente.clienteId, clienteId))
    .groupBy(ventasCliente.productoId)
    .all();

  const porProducto = new Map(vendidos.map((v) => [v.productoId, v.vendido]));

  return recibidos
    .map((r) => {
      const vendido = porProducto.get(r.productoId) ?? 0;
      return { ...r, vendido, disponible: r.recibido - vendido };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function entregasDelCliente(clienteId: string) {
  const filas = db
    .select({
      id: pedidos.id,
      numero: pedidos.numero,
      fecha: pedidos.fecha,
      entregadoEn: pedidos.entregadoEn,
      unidades: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
      totalCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
    })
    .from(pedidos)
    .leftJoin(pedidoItems, eq(pedidoItems.pedidoId, pedidos.id))
    .where(sql`${pedidos.clienteId} = ${clienteId} and ${pedidos.estado} = 'entregado'`)
    .groupBy(pedidos.id)
    .orderBy(desc(pedidos.fecha))
    .all();
  return filas;
}

export function ventasDelCliente(clienteId: string) {
  return db
    .select({
      id: ventasCliente.id,
      fecha: ventasCliente.fecha,
      cantidad: ventasCliente.cantidad,
      registradoPor: ventasCliente.registradoPor,
      nombre: productos.nombre,
      presentacion: productos.presentacion,
    })
    .from(ventasCliente)
    .innerJoin(productos, eq(productos.id, ventasCliente.productoId))
    .where(eq(ventasCliente.clienteId, clienteId))
    .orderBy(desc(ventasCliente.fecha), desc(ventasCliente.creadoEn))
    .all();
}

export function registrarVenta(datos: {
  clienteId: string;
  productoId: string;
  cantidad: number;
  fecha: string;
  registradoPor: string;
}): void {
  if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0) {
    throw new ErrorPanel("La cantidad vendida tiene que ser mayor a cero.");
  }

  const linea = stockDelCliente(datos.clienteId).find((l) => l.productoId === datos.productoId);
  if (!linea) throw new ErrorPanel("Todavía no recibiste ese producto.");
  if (datos.cantidad > linea.disponible) {
    throw new ErrorPanel(`Solo tenés ${linea.disponible} unidades disponibles de ${linea.nombre}.`);
  }

  db.insert(ventasCliente)
    .values({
      id: nuevoId(),
      clienteId: datos.clienteId,
      productoId: datos.productoId,
      cantidad: datos.cantidad,
      fecha: datos.fecha,
      registradoPor: datos.registradoPor,
      creadoEn: ahora(),
    })
    .run();
}

export function eliminarVenta(id: string, clienteId: string): void {
  db.delete(ventasCliente).where(sql`${ventasCliente.id} = ${id} and ${ventasCliente.clienteId} = ${clienteId}`).run();
}
