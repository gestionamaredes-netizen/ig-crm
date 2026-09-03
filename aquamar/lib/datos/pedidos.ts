import "server-only";
import { and, desc, eq, sql, inArray } from "drizzle-orm";
import { db } from "../db";
import { clientes, pedidoItems, pedidos, productos } from "../db/schema";
import type { EstadoPedido } from "../db/schema";
import { ahora, nuevoId } from "../formato";
import { escalasPorProducto, precioParaCantidad } from "./precios";
import { moverStock } from "./stock";

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

export async function listarPedidos(filtro: { clienteId?: string; estado?: EstadoPedido } = {}): Promise<PedidoConTotales[]> {
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

export async function obtenerPedido(
  id: string,
): Promise<(Pedido & { comercio: string; items: ItemConProducto[] }) | undefined> {
  const pedido = await db
    .select({ ...getPedidoColumns(), comercio: clientes.comercio })
    .from(pedidos)
    .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
    .where(eq(pedidos.id, id))
    .get();
  if (!pedido) return undefined;

  const items = await db
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
 * Congela precio y costo al momento de crear el pedido: si mañana cambia la
 * lista, el margen histórico tiene que seguir dando lo mismo.
 *
 * El precio sale de la escala que corresponde por cantidad, salvo que el
 * renglón traiga uno propio: Comercial siempre puede pisar la sugerencia.
 */
export async function crearPedido(datos: {
  clienteId: string;
  fecha: string;
  notas?: string;
  origen?: string;
  creadoPor?: string;
  items: { productoId: string; cantidad: number; precioUnitCentavos?: number | null }[];
}): Promise<string> {
  const items = datos.items.filter((i) => i.cantidad > 0);
  if (items.length === 0) throw new ErrorPedido("El pedido no tiene productos con cantidad.");

  const ids = items.map((i) => i.productoId);
  const lista = await db.select().from(productos).where(inArray(productos.id, ids)).all();
  const porId = new Map(lista.map((p) => [p.id, p]));
  for (const item of items) {
    if (!porId.has(item.productoId)) throw new ErrorPedido("Hay un producto que ya no existe en el catálogo.");
  }

  const escalas = await escalasPorProducto(ids);

  /** Precio del renglón: el que vino escrito a mano, o el de la escala. */
  const precioDe = (item: { productoId: string; cantidad: number; precioUnitCentavos?: number | null }): number => {
    if (item.precioUnitCentavos != null && item.precioUnitCentavos > 0) return item.precioUnitCentavos;
    const p = porId.get(item.productoId)!;
    return precioParaCantidad(item.cantidad, p.precioCentavos, escalas.get(item.productoId)?.escalas ?? []);
  };

  const id = nuevoId();
  await db.transaction(async (tx) => {
    const ultimo = await tx.select({ n: sql<number>`coalesce(max(${pedidos.numero}), 0)` }).from(pedidos).get();
    await tx.insert(pedidos)
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
      await tx.insert(pedidoItems)
        .values({
          id: nuevoId(),
          pedidoId: id,
          productoId: p.id,
          cantidad: item.cantidad,
          precioUnitCentavos: precioDe(item),
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
export async function cambiarEstado(pedidoId: string, estado: EstadoPedido): Promise<void> {
  await db.transaction(async (tx) => {
    const pedido = await tx.select().from(pedidos).where(eq(pedidos.id, pedidoId)).get();
    if (!pedido) throw new ErrorPedido("El pedido no existe.");
    if (pedido.estado === estado) return;

    const items = await tx.select().from(pedidoItems).where(eq(pedidoItems.pedidoId, pedidoId)).all();
    const entraAEntregado = estado === "entregado" && pedido.estado !== "entregado";
    const saleDeEntregado = pedido.estado === "entregado" && estado !== "entregado";

    if (entraAEntregado || saleDeEntregado) {
      const signo = entraAEntregado ? -1 : 1;
      for (const item of items) {
        await moverStock(tx, {
          productoId: item.productoId,
          tipo: entraAEntregado ? "salida" : "devolucion",
          cantidad: signo * item.cantidad,
          motivo: entraAEntregado ? `Entrega del pedido #${pedido.numero}` : `Pedido #${pedido.numero} vuelto a ${estado}`,
          pedidoId: pedido.id,
          fecha: pedido.fecha,
          registradoPor: "Pedidos",
        });
      }
    }

    await tx.update(pedidos)
      .set({ estado, entregadoEn: estado === "entregado" ? ahora() : null })
      .where(eq(pedidos.id, pedidoId))
      .run();
  });
}

export async function actualizarNotas(pedidoId: string, notas: string): Promise<void> {
  await db.update(pedidos).set({ notas }).where(eq(pedidos.id, pedidoId)).run();
}

export async function eliminarPedido(pedidoId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const pedido = await tx.select().from(pedidos).where(eq(pedidos.id, pedidoId)).get();
    if (!pedido) return;
    // Un pedido entregado ya descontó stock: al borrarlo hay que devolverlo.
    if (pedido.estado === "entregado") {
      const items = await tx.select().from(pedidoItems).where(eq(pedidoItems.pedidoId, pedidoId)).all();
      for (const item of items) {
        await moverStock(tx, {
          productoId: item.productoId,
          tipo: "devolucion",
          cantidad: item.cantidad,
          motivo: `Pedido #${pedido.numero} eliminado`,
          fecha: pedido.fecha,
          registradoPor: "Pedidos",
        });
      }
    }
    await tx.delete(pedidos).where(eq(pedidos.id, pedidoId)).run();
  });
}
