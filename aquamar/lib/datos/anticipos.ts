import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { anticipos, aplicacionesAnticipo, clientes, pedidoItems, pedidos } from "../db/schema";
import { cajaDe } from "../db/schema";
import { ahora, formatearPesos, nuevoId } from "../formato";
import { registrarMovimiento } from "./caja";

export type Anticipo = typeof anticipos.$inferSelect;
export type Aplicacion = typeof aplicacionesAnticipo.$inferSelect;

export class ErrorAnticipo extends Error {}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Cuánto de un anticipo todavía no se usó. Es la resta que impide pagar dos
 * pedidos con la misma plata.
 */
async function disponibleDe(ejecutor: typeof db | Tx, anticipoId: string, montoCentavos: number): Promise<number> {
  const fila = await ejecutor
    .select({ total: sql<number>`coalesce(sum(${aplicacionesAnticipo.montoCentavos}), 0)` })
    .from(aplicacionesAnticipo)
    .where(eq(aplicacionesAnticipo.anticipoId, anticipoId))
    .get();
  return montoCentavos - (fila?.total ?? 0);
}

/** Lo que falta cobrar de un pedido, a precios congelados. */
async function saldoDePedido(ejecutor: typeof db | Tx, pedidoId: string): Promise<{ total: number; saldo: number }> {
  const pedido = await ejecutor.select().from(pedidos).where(eq(pedidos.id, pedidoId)).get();
  if (!pedido) throw new ErrorAnticipo("El pedido no existe.");
  const fila = await ejecutor
    .select({ total: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)` })
    .from(pedidoItems)
    .where(eq(pedidoItems.pedidoId, pedidoId))
    .get();
  const total = fila?.total ?? 0;
  return { total, saldo: Math.max(0, total - pedido.cobradoCentavos) };
}

// ---------- Alta ----------

/**
 * El comercio deja plata antes de que haya nada entregado.
 *
 * Entra a la caja en el mismo movimiento, porque la plata está de verdad: con
 * eso se le compra al proveedor. Lo que todavía no hay es una venta, así que
 * no toca ningún pedido hasta que se aplique.
 */
export async function registrarAnticipo(datos: {
  clienteId: string;
  montoCentavos: number;
  /** Efectivo, transferencia, Mercado Pago… */
  forma: string;
  fecha: string;
  pedidoId?: string | null;
  notas?: string;
}): Promise<string> {
  if (!datos.clienteId) throw new ErrorAnticipo("Elegí de qué comercio es el anticipo.");
  if (!Number.isInteger(datos.montoCentavos) || datos.montoCentavos <= 0) {
    throw new ErrorAnticipo("El anticipo tiene que ser un importe mayor a cero.");
  }

  const id = nuevoId();
  await db.transaction(async (tx) => {
    const cliente = await tx.select().from(clientes).where(eq(clientes.id, datos.clienteId)).get();
    if (!cliente) throw new ErrorAnticipo("Ese comercio no existe.");

    await tx
      .insert(anticipos)
      .values({
        id,
        clienteId: datos.clienteId,
        fecha: datos.fecha,
        montoCentavos: datos.montoCentavos,
        forma: datos.forma,
        pedidoId: datos.pedidoId ?? null,
        notas: datos.notas?.trim() ?? "",
        creadoEn: ahora(),
      })
      .run();

    await registrarMovimiento(tx, {
      montoCentavos: datos.montoCentavos,
      medio: cajaDe(datos.forma),
      concepto: `Anticipo de ${cliente.comercio} · ${datos.forma}`,
      forma: datos.forma,
      fecha: datos.fecha,
      anticipoId: id,
    });
  });
  return id;
}

/**
 * Deshace un anticipo que no se usó: devuelve la plata por donde entró.
 *
 * Si ya se aplicó a un pedido no se puede borrar sin más, porque ese pedido
 * quedaría cobrado con plata que dejó de existir. Primero se suelta la
 * aplicación.
 */
export async function eliminarAnticipo(anticipoId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const anticipo = await tx.select().from(anticipos).where(eq(anticipos.id, anticipoId)).get();
    if (!anticipo) return;

    const aplicado = anticipo.montoCentavos - (await disponibleDe(tx, anticipoId, anticipo.montoCentavos));
    if (aplicado > 0) {
      throw new ErrorAnticipo(
        `Este anticipo ya tiene ${formatearPesos(aplicado)} aplicados a pedidos. Soltá esas aplicaciones primero.`,
      );
    }

    await registrarMovimiento(tx, {
      montoCentavos: -anticipo.montoCentavos,
      medio: cajaDe(anticipo.forma),
      concepto: `Anticipo devuelto${anticipo.forma ? ` · ${anticipo.forma}` : ""}`,
      forma: anticipo.forma,
      fecha: anticipo.fecha,
      anticipoId: anticipo.id,
    });
    await tx.delete(anticipos).where(eq(anticipos.id, anticipoId)).run();
  });
}

// ---------- Aplicación ----------

/**
 * Usa plata ya recibida para dar por cobrado un pedido.
 *
 * No escribe en la caja, y ese es todo el punto: el billete entró el día del
 * anticipo. Si acá se registrara un cobro, el mismo dinero figuraría dos
 * veces y la caja diría el doble de lo que hay en el cajón.
 */
export async function aplicarAnticipo(datos: {
  anticipoId: string;
  pedidoId: string;
  montoCentavos: number;
  fecha?: string;
}): Promise<void> {
  if (!Number.isInteger(datos.montoCentavos) || datos.montoCentavos <= 0) {
    throw new ErrorAnticipo("El importe a aplicar tiene que ser mayor a cero.");
  }

  await db.transaction(async (tx) => {
    const anticipo = await tx.select().from(anticipos).where(eq(anticipos.id, datos.anticipoId)).get();
    if (!anticipo) throw new ErrorAnticipo("El anticipo no existe.");

    const pedido = await tx.select().from(pedidos).where(eq(pedidos.id, datos.pedidoId)).get();
    if (!pedido) throw new ErrorAnticipo("El pedido no existe.");
    if (pedido.estado === "cancelado") throw new ErrorAnticipo("El pedido está cancelado.");
    if (pedido.clienteId !== anticipo.clienteId) {
      throw new ErrorAnticipo("El anticipo es de otro comercio: no se puede usar para este pedido.");
    }

    const disponible = await disponibleDe(tx, anticipo.id, anticipo.montoCentavos);
    if (datos.montoCentavos > disponible) {
      throw new ErrorAnticipo(
        disponible > 0
          ? `De ese anticipo quedan ${formatearPesos(disponible)} sin usar.`
          : "Ese anticipo ya está aplicado por completo.",
      );
    }

    const { saldo } = await saldoDePedido(tx, datos.pedidoId);
    if (datos.montoCentavos > saldo) {
      throw new ErrorAnticipo(
        saldo > 0
          ? `Al pedido le faltan ${formatearPesos(saldo)} por cobrar y estás aplicando más.`
          : "Ese pedido ya está cobrado.",
      );
    }

    await tx
      .insert(aplicacionesAnticipo)
      .values({
        id: nuevoId(),
        anticipoId: anticipo.id,
        pedidoId: datos.pedidoId,
        montoCentavos: datos.montoCentavos,
        fecha: datos.fecha ?? anticipo.fecha,
        creadoEn: ahora(),
      })
      .run();

    // El pedido queda cobrado. Y nada más: la caja no se toca.
    await tx
      .update(pedidos)
      .set({ cobradoCentavos: pedido.cobradoCentavos + datos.montoCentavos })
      .where(eq(pedidos.id, datos.pedidoId))
      .run();
  });
}

/** Suelta una aplicación: el pedido vuelve a deber y el anticipo queda libre. */
export async function soltarAplicacion(aplicacionId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const aplicacion = await tx
      .select()
      .from(aplicacionesAnticipo)
      .where(eq(aplicacionesAnticipo.id, aplicacionId))
      .get();
    if (!aplicacion) return;

    const pedido = await tx.select().from(pedidos).where(eq(pedidos.id, aplicacion.pedidoId)).get();
    if (pedido) {
      await tx
        .update(pedidos)
        .set({ cobradoCentavos: Math.max(0, pedido.cobradoCentavos - aplicacion.montoCentavos) })
        .where(eq(pedidos.id, aplicacion.pedidoId))
        .run();
    }
    await tx.delete(aplicacionesAnticipo).where(eq(aplicacionesAnticipo.id, aplicacionId)).run();
  });
}

/**
 * Suelta todas las aplicaciones de un pedido. La llama el borrado de pedidos:
 * si el pedido deja de existir, su parte del anticipo vuelve a estar
 * disponible en vez de quedar colgada de algo que ya no está.
 */
export async function soltarAplicacionesDePedido(ejecutor: typeof db | Tx, pedidoId: string): Promise<void> {
  await ejecutor.delete(aplicacionesAnticipo).where(eq(aplicacionesAnticipo.pedidoId, pedidoId)).run();
}

// ---------- Consultas ----------

export type AnticipoConSaldo = Anticipo & {
  comercio: string;
  aplicadoCentavos: number;
  disponibleCentavos: number;
};

export async function listarAnticipos(filtro: { clienteId?: string } = {}): Promise<AnticipoConSaldo[]> {
  const filas = await db
    .select({
      id: anticipos.id,
      clienteId: anticipos.clienteId,
      fecha: anticipos.fecha,
      montoCentavos: anticipos.montoCentavos,
      forma: anticipos.forma,
      pedidoId: anticipos.pedidoId,
      notas: anticipos.notas,
      creadoEn: anticipos.creadoEn,
      comercio: clientes.comercio,
      aplicadoCentavos: sql<number>`coalesce(sum(${aplicacionesAnticipo.montoCentavos}), 0)`,
    })
    .from(anticipos)
    .innerJoin(clientes, eq(clientes.id, anticipos.clienteId))
    .leftJoin(aplicacionesAnticipo, eq(aplicacionesAnticipo.anticipoId, anticipos.id))
    .where(filtro.clienteId ? eq(anticipos.clienteId, filtro.clienteId) : undefined)
    .groupBy(anticipos.id)
    .orderBy(desc(anticipos.fecha), desc(anticipos.creadoEn))
    .all();

  return filas.map((f) => ({ ...f, disponibleCentavos: f.montoCentavos - f.aplicadoCentavos }));
}

/** Los anticipos de un comercio que todavía tienen plata sin usar. */
export async function disponiblesDeCliente(clienteId: string): Promise<AnticipoConSaldo[]> {
  return (await listarAnticipos({ clienteId })).filter((a) => a.disponibleCentavos > 0);
}

export type SaldoAnticipos = {
  recibidoCentavos: number;
  aplicadoCentavos: number;
  disponibleCentavos: number;
};

/** Cuánta plata de clientes está en la caja sin corresponder a una entrega. */
export async function saldoDeAnticipos(clienteId?: string): Promise<SaldoAnticipos> {
  const lista = await listarAnticipos(clienteId ? { clienteId } : {});
  return {
    recibidoCentavos: lista.reduce((a, x) => a + x.montoCentavos, 0),
    aplicadoCentavos: lista.reduce((a, x) => a + x.aplicadoCentavos, 0),
    disponibleCentavos: lista.reduce((a, x) => a + x.disponibleCentavos, 0),
  };
}

export type AplicacionDePedido = Aplicacion & { fechaAnticipo: string; forma: string };

export async function aplicacionesDePedido(pedidoId: string): Promise<AplicacionDePedido[]> {
  return db
    .select({
      id: aplicacionesAnticipo.id,
      anticipoId: aplicacionesAnticipo.anticipoId,
      pedidoId: aplicacionesAnticipo.pedidoId,
      montoCentavos: aplicacionesAnticipo.montoCentavos,
      fecha: aplicacionesAnticipo.fecha,
      creadoEn: aplicacionesAnticipo.creadoEn,
      fechaAnticipo: anticipos.fecha,
      forma: anticipos.forma,
    })
    .from(aplicacionesAnticipo)
    .innerJoin(anticipos, eq(anticipos.id, aplicacionesAnticipo.anticipoId))
    .where(eq(aplicacionesAnticipo.pedidoId, pedidoId))
    .orderBy(asc(aplicacionesAnticipo.fecha))
    .all();
}

export type PedidoPagadoSinEntregar = {
  id: string;
  numero: number;
  fecha: string;
  comercio: string;
  estado: string;
  totalCentavos: number;
  cobradoCentavos: number;
};

/**
 * Lo que el comercio ya pagó y todavía no recibió. Es la deuda de mercadería
 * de Aqua Mar: plata que está en la caja pero que tiene dueño.
 */
export async function pagadosSinEntregar(): Promise<PedidoPagadoSinEntregar[]> {
  const filas = await db
    .select({
      id: pedidos.id,
      numero: pedidos.numero,
      fecha: pedidos.fecha,
      comercio: clientes.comercio,
      estado: pedidos.estado,
      cobradoCentavos: pedidos.cobradoCentavos,
      totalCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
    })
    .from(pedidos)
    .innerJoin(clientes, eq(clientes.id, pedidos.clienteId))
    .leftJoin(pedidoItems, eq(pedidoItems.pedidoId, pedidos.id))
    .where(and(sql`${pedidos.estado} in ('pendiente', 'preparando')`, sql`${pedidos.cobradoCentavos} > 0`))
    .groupBy(pedidos.id)
    .orderBy(asc(pedidos.fecha))
    .all();

  return filas.filter((f) => f.totalCentavos > 0 && f.cobradoCentavos >= f.totalCentavos);
}
