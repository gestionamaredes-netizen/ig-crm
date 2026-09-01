import "server-only";
import { and, desc, eq, sql, inArray } from "drizzle-orm";
import { db } from "../db";
import { clientes, pedidoItems, pedidos, productos } from "../db/schema";
import type { EstadoPedido } from "../db/schema";
import { ahora, nuevoId } from "../formato";

export type Pedido = typeof pedidos.$inferSelect;
export type PedidoItem = typeof pedidoItems.$inferSelect;

export type ItemConProducto = PedidoItem & { nombre: string; presentacion: string };

export type PedidoConTotales = Pedido & {
  comercio: string;
  unidades: number;
  totalCentavos: number;
  costoCentavos: number;
};

const totalesPorPedido = {
  unidades: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
  totalCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
  costoCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.costoUnitCentavos}), 0)`,
};

export function listarPedidos(filtro: { clienteId?: string; estado?: EstadoPedido } = {}): PedidoConTotales[] {
  const condiciones = [];
  if (filtro.clienteId) condiciones.push(eq(pedidos.clienteId, filtro.clienteId));
  if (filtro.estado) condiciones.push(eq(pedidos.estado, filtro.estado));

  return db
    .select({
      ...getPedidoColumns(),
      comercio: clientes.comercio,
      ...totalesPorPedido,
    })
    .from(pedidos)
    .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
    .leftJoin(pedidoItems, eq(pedidoItems.pedidoId, pedidos.id))
    .where(condiciones.length ? and(...condiciones) : undefined)
    .groupBy(pedidos.id)
    .orderBy(desc(pedidos.fecha), desc(pedidos.numero))
    .all();
}

function getPedidoColumns() {
  return {
    id: pedidos.id,
    numero: pedidos.numero,
    clienteId: pedidos.clienteId,
    fecha: pedidos.fecha,
    estado: pedidos.estado,
    notas: pedidos.notas,
    origen: pedidos.origen,
    creadoPor: pedidos.creadoPor,
    creadoEn: pedidos.creadoEn,
    entregadoEn: pedidos.entregadoEn,
  };
}

export function obtenerPedido(id: string): (Pedido & { comercio: string; items: ItemConProducto[] }) | undefined {
  const pedido = db
    .select({ ...getPedidoColumns(), comercio: clientes.comercio })
    .from(pedidos)
    .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
    .where(eq(pedidos.id, id))
    .get();
  if (!pedido) return undefined;

  const items = db
    .select({
      id: pedidoItems.id,
      pedidoId: pedidoItems.pedidoId,
      productoId: pedidoItems.productoId,
      cantidad: pedidoItems.cantidad,
      precioUnitCentavos: pedidoItems.precioUnitCentavos,
      costoUnitCentavos: pedidoItems.costoUnitCentavos,
      nombre: productos.nombre,
      presentacion: productos.presentacion,
    })
    .from(pedidoItems)
    .innerJoin(productos, eq(productos.id, pedidoItems.productoId))
    .where(eq(pedidoItems.pedidoId, id))
    .all();

  return { ...pedido, items };
}

export function totalPedido(items: Pick<PedidoItem, "cantidad" | "precioUnitCentavos">[]): number {
  return items.reduce((acc, i) => acc + i.cantidad * i.precioUnitCentavos, 0);
}

export class ErrorPedido extends Error {}

/**
 * Congela precio y costo de lista al momento de crear el pedido: si mañana
 * cambia la lista, el margen histórico tiene que seguir dando lo mismo.
 */
export function crearPedido(datos: {
  clienteId: string;
  fecha: string;
  notas?: string;
  origen?: string;
  creadoPor?: string;
  items: { productoId: string; cantidad: number }[];
}): string {
  const items = datos.items.filter((i) => i.cantidad > 0);
  if (items.length === 0) throw new ErrorPedido("El pedido no tiene productos con cantidad.");

  const ids = items.map((i) => i.productoId);
  const lista = db.select().from(productos).where(inArray(productos.id, ids)).all();
  const porId = new Map(lista.map((p) => [p.id, p]));
  for (const item of items) {
    if (!porId.has(item.productoId)) throw new ErrorPedido("Hay un producto que ya no existe en el catálogo.");
  }

  const id = nuevoId();
  db.transaction((tx) => {
    const ultimo = tx.select({ n: sql<number>`coalesce(max(${pedidos.numero}), 0)` }).from(pedidos).get();
    tx.insert(pedidos)
      .values({
        id,
        numero: (ultimo?.n ?? 0) + 1,
        clienteId: datos.clienteId,
        fecha: datos.fecha,
        estado: "pendiente",
        notas: datos.notas ?? "",
        origen: datos.origen ?? "admin",
        creadoPor: datos.creadoPor ?? "",
        creadoEn: ahora(),
      })
      .run();

    for (const item of items) {
      const p = porId.get(item.productoId)!;
      tx.insert(pedidoItems)
        .values({
          id: nuevoId(),
          pedidoId: id,
          productoId: p.id,
          cantidad: item.cantidad,
          precioUnitCentavos: p.precioCentavos,
          costoUnitCentavos: p.costoCentavos,
        })
        .run();
    }
  });
  return id;
}

/**
 * El stock del mayorista se mueve al entregar. Volver atrás un pedido entregado
 * reintegra las unidades, así que el stock nunca queda descontado dos veces.
 */
export function cambiarEstado(pedidoId: string, estado: EstadoPedido): void {
  db.transaction((tx) => {
    const pedido = tx.select().from(pedidos).where(eq(pedidos.id, pedidoId)).get();
    if (!pedido) throw new ErrorPedido("El pedido no existe.");
    if (pedido.estado === estado) return;

    const items = tx.select().from(pedidoItems).where(eq(pedidoItems.pedidoId, pedidoId)).all();
    const entraAEntregado = estado === "entregado" && pedido.estado !== "entregado";
    const saleDeEntregado = pedido.estado === "entregado" && estado !== "entregado";

    if (entraAEntregado || saleDeEntregado) {
      const signo = entraAEntregado ? -1 : 1;
      for (const item of items) {
        tx.update(productos)
          .set({ stock: sql`${productos.stock} + ${signo * item.cantidad}` })
          .where(eq(productos.id, item.productoId))
          .run();
      }
    }

    tx.update(pedidos)
      .set({ estado, entregadoEn: estado === "entregado" ? ahora() : null })
      .where(eq(pedidos.id, pedidoId))
      .run();
  });
}

export function actualizarNotas(pedidoId: string, notas: string): void {
  db.update(pedidos).set({ notas }).where(eq(pedidos.id, pedidoId)).run();
}

export function eliminarPedido(pedidoId: string): void {
  db.transaction((tx) => {
    const pedido = tx.select().from(pedidos).where(eq(pedidos.id, pedidoId)).get();
    if (!pedido) return;
    // Un pedido entregado ya descontó stock: al borrarlo hay que devolverlo.
    if (pedido.estado === "entregado") {
      const items = tx.select().from(pedidoItems).where(eq(pedidoItems.pedidoId, pedidoId)).all();
      for (const item of items) {
        tx.update(productos)
          .set({ stock: sql`${productos.stock} + ${item.cantidad}` })
          .where(eq(productos.id, item.productoId))
          .run();
      }
    }
    tx.delete(pedidos).where(eq(pedidos.id, pedidoId)).run();
  });
}
