import "server-only";
import { and, desc, eq, sql, inArray } from "drizzle-orm";
import { db } from "../db";
import { clientes, movimientosCaja, pedidoItems, pedidos, productos } from "../db/schema";
import type { EstadoPedido } from "../db/schema";
import { cajaDe } from "../db/schema";
import { ahora, nuevoId } from "../formato";
import { registrarMovimiento } from "./caja";
import { escalasPorProducto, listaDeCliente, precioParaCantidad } from "./precios";
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
    fechaEntrega: pedidos.fechaEntrega,
    tipoEntrega: pedidos.tipoEntrega,
    formaPago: pedidos.formaPago,
    cobradoCentavos: pedidos.cobradoCentavos,
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

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

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
  formaPago?: string;
  fechaEntrega?: string | null;
  tipoEntrega?: string;
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

  const escalas = await escalasPorProducto(ids, await listaDeCliente(datos.clienteId));

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
        formaPago: datos.formaPago ?? "efectivo",
        fechaEntrega: datos.fechaEntrega || null,
        tipoEntrega: datos.tipoEntrega ?? "reparto propio",
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

/** Datos de la entrega: cuándo se prometió y cómo viaja la mercadería. */
export async function actualizarEntrega(
  pedidoId: string,
  datos: { fechaEntrega?: string | null; tipoEntrega?: string; notas?: string },
): Promise<void> {
  await db
    .update(pedidos)
    .set({
      fechaEntrega: datos.fechaEntrega || null,
      ...(datos.tipoEntrega ? { tipoEntrega: datos.tipoEntrega } : {}),
      ...(datos.notas !== undefined ? { notas: datos.notas } : {}),
    })
    .where(eq(pedidos.id, pedidoId))
    .run();
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

// ---------- Cobranza ----------

export type EstadoCobro = "cobrado" | "parcial" | "pendiente";

/** Se deduce del saldo: no puede quedar marcado "cobrado" con plata a cobrar. */
export function estadoCobro(p: { cobradoCentavos: number; totalCentavos: number }): EstadoCobro {
  if (p.totalCentavos > 0 && p.cobradoCentavos >= p.totalCentavos) return "cobrado";
  if (p.cobradoCentavos > 0) return "parcial";
  return "pendiente";
}

export function saldoPedido(p: { cobradoCentavos: number; totalCentavos: number }): number {
  return Math.max(0, p.totalCentavos - p.cobradoCentavos);
}

/** Total del pedido a precios congelados, para no recalcularlo en cada pantalla. */
async function totalDe(ejecutor: typeof db | Tx, pedidoId: string): Promise<number> {
  const fila = await ejecutor
    .select({
      total: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
    })
    .from(pedidoItems)
    .where(eq(pedidoItems.pedidoId, pedidoId))
    .get();
  return fila?.total ?? 0;
}

/**
 * Cobrar entra la plata a la caja en el mismo movimiento: el pedido y el libro
 * no pueden decir cosas distintas porque se escriben juntos.
 */
export async function registrarCobro(datos: {
  pedidoId: string;
  montoCentavos: number;
  /** Cómo pagó: efectivo, transferencia, Mercado Pago… */
  forma: string;
  fecha?: string;
}): Promise<void> {
  if (datos.montoCentavos <= 0) throw new ErrorPedido("El cobro tiene que ser mayor a cero.");

  await db.transaction(async (tx) => {
    const pedido = await tx.select().from(pedidos).where(eq(pedidos.id, datos.pedidoId)).get();
    if (!pedido) throw new ErrorPedido("El pedido no existe.");
    if (pedido.estado === "cancelado") throw new ErrorPedido("El pedido está cancelado.");

    const total = await totalDe(tx, datos.pedidoId);
    const cobrado = pedido.cobradoCentavos + datos.montoCentavos;
    if (cobrado > total) {
      throw new ErrorPedido(
        `Ese cobro se pasa del total: quedan ${((total - pedido.cobradoCentavos) / 100).toFixed(2)} por cobrar.`,
      );
    }

    await tx.update(pedidos).set({ cobradoCentavos: cobrado }).where(eq(pedidos.id, datos.pedidoId)).run();

    // La forma va en el concepto: la caja guarda dos saldos, pero el recibo
    // tiene que poder decir si entró por transferencia o en mano.
    const parcial = cobrado < total ? " (parcial)" : "";
    await registrarMovimiento(tx, {
      montoCentavos: datos.montoCentavos,
      medio: cajaDe(datos.forma),
      concepto: `Cobro del pedido #${pedido.numero} · ${datos.forma}${parcial}`,
      forma: datos.forma,
      fecha: datos.fecha ?? pedido.fecha,
      pedidoId: pedido.id,
    });
  });
}

export async function actualizarFormaPago(pedidoId: string, formaPago: string): Promise<void> {
  await db.update(pedidos).set({ formaPago }).where(eq(pedidos.id, pedidoId)).run();
}

/** Lo que deben los comercios: pedidos entregados con saldo abierto. */
export async function cuentasPorCobrar() {
  const filas = await db
    .select({
      clienteId: clientes.id,
      comercio: clientes.comercio,
      pedidoId: pedidos.id,
      numero: pedidos.numero,
      fecha: pedidos.fecha,
      cobradoCentavos: pedidos.cobradoCentavos,
      totalCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
    })
    .from(pedidos)
    .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
    .leftJoin(pedidoItems, eq(pedidoItems.pedidoId, pedidos.id))
    .where(eq(pedidos.estado, "entregado"))
    .groupBy(pedidos.id)
    .all();

  return filas
    .map((f) => ({ ...f, saldoCentavos: f.totalCentavos - f.cobradoCentavos }))
    .filter((f) => f.saldoCentavos > 0)
    .sort((a, b) => b.saldoCentavos - a.saldoCentavos);
}

/**
 * Los cobros que ya entraron por este pedido. Salen del libro de caja, que es
 * donde quedaron anotados: no hay una segunda lista que pueda no coincidir.
 */
export async function cobrosDePedido(pedidoId: string) {
  return db
    .select({
      id: movimientosCaja.id,
      fecha: movimientosCaja.fecha,
      concepto: movimientosCaja.concepto,
      medio: movimientosCaja.medio,
      montoCentavos: movimientosCaja.montoCentavos,
    })
    .from(movimientosCaja)
    .where(and(eq(movimientosCaja.pedidoId, pedidoId), sql`${movimientosCaja.montoCentavos} > 0`))
    .orderBy(movimientosCaja.fecha, movimientosCaja.creadoEn)
    .all();
}
