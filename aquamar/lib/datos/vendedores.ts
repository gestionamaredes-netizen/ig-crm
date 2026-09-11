import "server-only";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { clientes, pagosComision, pedidos, vendedores } from "../db/schema";
import type { ModalidadVendedor } from "../db/schema";
import { MODALIDADES_VENDEDOR, cajaDe } from "../db/schema";
import { ahora, hoy, nuevoId } from "../formato";
import { borrarPorPagoComision, registrarMovimiento } from "./caja";

export type Vendedor = typeof vendedores.$inferSelect;

export class ErrorVendedor extends Error {}

export async function listarVendedores(soloActivos = false): Promise<Vendedor[]> {
  const filas = await db.select().from(vendedores).orderBy(asc(vendedores.nombre)).all();
  return soloActivos ? filas.filter((v) => v.activo) : filas;
}

export async function obtenerVendedor(id: string): Promise<Vendedor | undefined> {
  if (!id) return undefined;
  return db.select().from(vendedores).where(eq(vendedores.id, id)).get();
}

export type DatosVendedor = {
  nombre: string;
  color?: string;
  modalidad?: ModalidadVendedor;
  comisionPorBultoCentavos?: number;
  listaPrecioId?: string | null;
  telefono?: string;
  notas?: string;
};

export async function crearVendedor(datos: DatosVendedor): Promise<string> {
  const nombre = datos.nombre.trim();
  if (!nombre) throw new ErrorVendedor("El vendedor necesita un nombre.");
  validar(datos);

  const id = nuevoId();
  await db
    .insert(vendedores)
    .values({
      id,
      nombre,
      color: datos.color || "azul",
      modalidad: datos.modalidad ?? "comisión",
      comisionPorBultoCentavos: datos.comisionPorBultoCentavos ?? 0,
      listaPrecioId: datos.listaPrecioId || null,
      telefono: datos.telefono?.trim() ?? "",
      notas: datos.notas?.trim() ?? "",
      activo: true,
      creadoEn: ahora(),
    })
    .run();
  return id;
}

export async function actualizarVendedor(id: string, datos: Partial<Vendedor>): Promise<void> {
  if (datos.nombre !== undefined && !datos.nombre.trim()) {
    throw new ErrorVendedor("El vendedor necesita un nombre.");
  }
  validar(datos);
  await db.update(vendedores).set(datos).where(eq(vendedores.id, id)).run();
}

function validar(datos: Partial<DatosVendedor>): void {
  if (datos.modalidad !== undefined && !MODALIDADES_VENDEDOR.includes(datos.modalidad)) {
    throw new ErrorVendedor("Esa modalidad no existe.");
  }
  if (datos.comisionPorBultoCentavos !== undefined && datos.comisionPorBultoCentavos < 0) {
    throw new ErrorVendedor("La comisión por bulto no puede ser negativa.");
  }
}

/**
 * La comisión de un renglón: tanto por bulto, proporcional a lo que se vendió.
 * Media docena de un bulto de doce paga media comisión —cobrar el bulto entero
 * por seis envases sería regalar plata, y no cobrar nada sería robársela al
 * vendedor—. Se redondea al centavo, que es la unidad en la que se paga.
 */
export function comisionDeRenglon(cantidad: number, unidadesPorBulto: number, porBultoCentavos: number): number {
  if (porBultoCentavos <= 0 || cantidad <= 0) return 0;
  return Math.round((cantidad * porBultoCentavos) / Math.max(1, unidadesPorBulto));
}

export type PagoComision = typeof pagosComision.$inferSelect;

/**
 * Se le paga al vendedor lo que se le venía debiendo. Sale de la caja por el
 * medio que se usó —el efectivo del cajón o el banco—, en el mismo movimiento:
 * no hay que anotarlo dos veces ni existe una liquidación pagada que la caja no
 * haya visto.
 *
 * A un sub-distribuidor no se le liquida nada: su ganancia es su reventa. Si
 * alguien intenta pagarle una comisión es que se equivocó de vendedor, y vale
 * más frenarlo que dejar la caja con una salida que no corresponde.
 */
export async function registrarPagoComision(datos: {
  vendedorId: string;
  montoCentavos: number;
  forma: string;
  fecha?: string;
  notas?: string;
}): Promise<string> {
  if (datos.montoCentavos <= 0) throw new ErrorVendedor("El pago tiene que ser mayor a cero.");

  const id = nuevoId();
  await db.transaction(async (tx) => {
    const vendedor = await tx.select().from(vendedores).where(eq(vendedores.id, datos.vendedorId)).get();
    if (!vendedor) throw new ErrorVendedor("Ese vendedor no existe.");
    if (vendedor.modalidad !== "comisión") {
      throw new ErrorVendedor(`${vendedor.nombre} es sub-distribuidor: no se le liquidan comisiones.`);
    }

    const forma = datos.forma || "efectivo";
    const fecha = datos.fecha || hoy();
    await tx
      .insert(pagosComision)
      .values({
        id,
        vendedorId: vendedor.id,
        fecha,
        montoCentavos: datos.montoCentavos,
        forma,
        notas: datos.notas?.trim() ?? "",
        creadoEn: ahora(),
      })
      .run();

    await registrarMovimiento(tx, {
      montoCentavos: -datos.montoCentavos,
      medio: cajaDe(forma),
      concepto: `Pago de comisión a ${vendedor.nombre} · ${forma}`,
      forma,
      fecha,
      pagoComisionId: id,
    });
  });
  return id;
}

/** Un pago cargado mal: se borra y la plata vuelve a la caja. */
export async function eliminarPagoComision(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const pago = await tx.select().from(pagosComision).where(eq(pagosComision.id, id)).get();
    if (!pago) return;
    await borrarPorPagoComision(tx, id);
    await tx.delete(pagosComision).where(eq(pagosComision.id, id)).run();
  });
}

export async function pagosDeVendedor(vendedorId: string, limite = 20): Promise<PagoComision[]> {
  return db
    .select()
    .from(pagosComision)
    .where(eq(pagosComision.vendedorId, vendedorId))
    .orderBy(desc(pagosComision.fecha), desc(pagosComision.creadoEn))
    .limit(limite)
    .all();
}

export type LineaLiquidacion = {
  vendedor: Vendedor;
  /** Pedidos entregados en el período: son los que devengan comisión. */
  pedidos: number;
  unidades: number;
  ventasCentavos: number;
  comisionCentavos: number;
  /** Lo que se le pagó dentro del período. */
  pagadoCentavos: number;
  /**
   * Lo que se le debe hoy, mirando toda la historia y no solo el período: la
   * comisión es una cuenta corriente, y lo que se ganó en septiembre se suele
   * pagar en octubre. Un saldo de período daría siempre mal.
   */
  saldoCentavos: number;
  /** Comercios de ese vendedor, aunque en el período no hayan comprado. */
  comercios: number;
};

/**
 * Qué se le debe a cada vendedor en el período.
 *
 * Cuenta solo los pedidos entregados: la comisión se gana cuando la mercadería
 * llegó, no cuando se cargó el pedido. Un pedido pendiente o cancelado no se
 * liquida, y uno borrado desaparece con su comisión.
 */
export async function liquidacion(rango: { desde: string; hasta: string }): Promise<LineaLiquidacion[]> {
  const lista = await listarVendedores();
  if (lista.length === 0) return [];

  const ids = lista.map((v) => v.id);

  const porVendedor = await db
    .select({
      vendedorId: pedidos.vendedorId,
      pedidos: sql<number>`count(distinct ${pedidos.id})`,
      comisionCentavos: sql<number>`coalesce(sum(${pedidos.comisionCentavos}), 0)`,
    })
    .from(pedidos)
    .where(
      and(
        inArray(pedidos.vendedorId, ids),
        eq(pedidos.estado, "entregado"),
        gte(pedidos.fecha, rango.desde),
        lte(pedidos.fecha, rango.hasta),
      ),
    )
    .groupBy(pedidos.vendedorId)
    .all();

  // Las unidades y la venta salen de los renglones, que es donde está el detalle.
  const totales = await db.all<{ vendedor_id: string; unidades: number; venta: number }>(sql`
    select p.vendedor_id as vendedor_id,
           coalesce(sum(i.cantidad), 0) as unidades,
           coalesce(sum(i.cantidad * i.precio_unit_centavos), 0) as venta
      from pedidos p
      join pedido_items i on i.pedido_id = p.id
     where p.estado = 'entregado'
       and p.fecha >= ${rango.desde}
       and p.fecha <= ${rango.hasta}
       and p.vendedor_id is not null
     group by p.vendedor_id
  `);

  const comercios = await db
    .select({ vendedorId: clientes.vendedorId, cuantos: sql<number>`count(*)` })
    .from(clientes)
    .where(and(inArray(clientes.vendedorId, ids), eq(clientes.activo, true)))
    .groupBy(clientes.vendedorId)
    .all();

  const pagos = await db
    .select({
      vendedorId: pagosComision.vendedorId,
      enPeriodo: sql<number>`coalesce(sum(case when ${pagosComision.fecha} between ${rango.desde} and ${rango.hasta} then ${pagosComision.montoCentavos} else 0 end), 0)`,
      historico: sql<number>`coalesce(sum(${pagosComision.montoCentavos}), 0)`,
    })
    .from(pagosComision)
    .groupBy(pagosComision.vendedorId)
    .all();

  // El saldo mira toda la historia, no el período: ver abajo en el tipo.
  const ganadoHistorico = await db
    .select({
      vendedorId: pedidos.vendedorId,
      total: sql<number>`coalesce(sum(${pedidos.comisionCentavos}), 0)`,
    })
    .from(pedidos)
    .where(and(inArray(pedidos.vendedorId, ids), eq(pedidos.estado, "entregado")))
    .groupBy(pedidos.vendedorId)
    .all();

  const porId = new Map(porVendedor.map((f) => [f.vendedorId ?? "", f]));
  const pagado = new Map(pagos.map((f) => [f.vendedorId, f]));
  const ganado = new Map(ganadoHistorico.map((f) => [f.vendedorId ?? "", f.total]));
  const detalle = new Map(totales.map((f) => [f.vendedor_id, f]));
  const cartera = new Map(comercios.map((f) => [f.vendedorId ?? "", f.cuantos]));

  return lista
    .map((vendedor) => ({
      vendedor,
      pedidos: porId.get(vendedor.id)?.pedidos ?? 0,
      unidades: detalle.get(vendedor.id)?.unidades ?? 0,
      ventasCentavos: detalle.get(vendedor.id)?.venta ?? 0,
      comisionCentavos: porId.get(vendedor.id)?.comisionCentavos ?? 0,
      pagadoCentavos: pagado.get(vendedor.id)?.enPeriodo ?? 0,
      saldoCentavos: (ganado.get(vendedor.id) ?? 0) - (pagado.get(vendedor.id)?.historico ?? 0),
      comercios: cartera.get(vendedor.id) ?? 0,
    }))
    .sort((a, b) => b.saldoCentavos - a.saldoCentavos || a.vendedor.nombre.localeCompare(b.vendedor.nombre));
}
