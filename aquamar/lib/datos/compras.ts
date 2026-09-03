import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { compraItems, compras, productos, proveedores } from "../db/schema";
import type { EstadoCompra } from "../db/schema";
import { ahora, nuevoId } from "../formato";
import { ivaEsRecuperable, regimenActual, type Regimen } from "./config";
import { moverStock } from "./stock";

export type Compra = typeof compras.$inferSelect;
export type CompraItem = typeof compraItems.$inferSelect;

export class ErrorCompra extends Error {}

// ---------- Cálculo ----------

export type RenglonCrudo = {
  productoId: string;
  cantidad: number;
  costoUnitNetoCentavos: number;
  /** Centésimos de punto: 2100 = 21%. */
  ivaAlicuota: number;
};

export type RenglonCalculado = RenglonCrudo & {
  netoLineaCentavos: number;
  ivaCentavos: number;
  prorrateoCentavos: number;
  costoRealUnitCentavos: number;
};

export type TotalesCompra = {
  renglones: RenglonCalculado[];
  netoCentavos: number;
  ivaCentavos: number;
  percepcionesCentavos: number;
  otrosCentavos: number;
  totalCentavos: number;
};

/**
 * Convierte los renglones de una factura en costos reales por unidad.
 *
 * Percepciones y otros costos (flete, acarreo) vienen a nivel factura pero son
 * costo de la mercadería, así que se reparten entre los renglones a prorrata de
 * lo que pesa cada uno. El IVA entra al costo solo si el régimen no lo deja
 * computar: para un Responsable Inscripto es crédito fiscal, no costo.
 *
 * Es una función pura para poder probar la aritmética sin base de datos.
 */
export function calcularCompra(
  renglones: RenglonCrudo[],
  extras: { percepcionesCentavos?: number; otrosCentavos?: number },
  regimen: Regimen,
): TotalesCompra {
  const percepciones = extras.percepcionesCentavos ?? 0;
  const otros = extras.otrosCentavos ?? 0;
  const aRepartir = percepciones + otros;

  const netos = renglones.map((r) => r.cantidad * r.costoUnitNetoCentavos);
  const ivas = renglones.map((r, i) => Math.round((netos[i] * r.ivaAlicuota) / 10000));

  const neto = netos.reduce((a, b) => a + b, 0);
  const iva = ivas.reduce((a, b) => a + b, 0);
  const unidades = renglones.reduce((a, r) => a + r.cantidad, 0);

  // Si la factura viene en cero neto (bonificación, muestras) el prorrateo por
  // importe daría dividir por cero: ahí se reparte por unidades.
  const base = neto > 0 ? netos : renglones.map((r) => r.cantidad);
  const totalBase = neto > 0 ? neto : unidades;

  let repartido = 0;
  const prorrateos = base.map((b, i) => {
    // El último renglón se lleva el resto para que la suma cierre al centavo.
    if (i === base.length - 1) return aRepartir - repartido;
    const parte = totalBase > 0 ? Math.round((aRepartir * b) / totalBase) : 0;
    repartido += parte;
    return parte;
  });

  const ivaVaAlCosto = !ivaEsRecuperable(regimen);

  const calculados: RenglonCalculado[] = renglones.map((r, i) => {
    const costoLinea = netos[i] + (prorrateos[i] ?? 0) + (ivaVaAlCosto ? ivas[i] : 0);
    return {
      ...r,
      netoLineaCentavos: netos[i],
      ivaCentavos: ivas[i],
      prorrateoCentavos: prorrateos[i] ?? 0,
      costoRealUnitCentavos: r.cantidad > 0 ? Math.round(costoLinea / r.cantidad) : 0,
    };
  });

  return {
    renglones: calculados,
    netoCentavos: neto,
    ivaCentavos: iva,
    percepcionesCentavos: percepciones,
    otrosCentavos: otros,
    totalCentavos: neto + iva + percepciones + otros,
  };
}

/**
 * Costo promedio ponderado después de que entran unidades nuevas a otro precio.
 * Las ventas no lo mueven —salen al promedio—, así que solo se recalcula acá.
 */
export function promedioPonderado(
  stockPrevio: number,
  costoPrevio: number,
  cantidadNueva: number,
  costoNuevo: number,
): number {
  if (stockPrevio <= 0 || costoPrevio <= 0) return costoNuevo;
  if (cantidadNueva <= 0) return costoPrevio;
  return Math.round((stockPrevio * costoPrevio + cantidadNueva * costoNuevo) / (stockPrevio + cantidadNueva));
}

// ---------- Consultas ----------

export type CompraConProveedor = Compra & { proveedor: string; unidades: number; renglones: number };

export async function listarCompras(
  filtro: { proveedorId?: string; estado?: EstadoCompra; desde?: string; hasta?: string } = {},
): Promise<CompraConProveedor[]> {
  const condiciones = [];
  if (filtro.proveedorId) condiciones.push(eq(compras.proveedorId, filtro.proveedorId));
  if (filtro.estado) condiciones.push(eq(compras.estado, filtro.estado));
  if (filtro.desde) condiciones.push(sql`${compras.fecha} >= ${filtro.desde}`);
  if (filtro.hasta) condiciones.push(sql`${compras.fecha} <= ${filtro.hasta}`);

  return db
    .select({
      ...columnasCompra(),
      proveedor: proveedores.nombre,
      unidades: sql<number>`coalesce(sum(${compraItems.cantidad}), 0)`,
      renglones: sql<number>`count(${compraItems.id})`,
    })
    .from(compras)
    .innerJoin(proveedores, eq(proveedores.id, compras.proveedorId))
    .leftJoin(compraItems, eq(compraItems.compraId, compras.id))
    .where(condiciones.length ? and(...condiciones) : undefined)
    .groupBy(compras.id)
    .orderBy(desc(compras.fecha), desc(compras.numero))
    .all();
}

function columnasCompra() {
  return {
    id: compras.id,
    numero: compras.numero,
    proveedorId: compras.proveedorId,
    fecha: compras.fecha,
    comprobante: compras.comprobante,
    netoCentavos: compras.netoCentavos,
    ivaCentavos: compras.ivaCentavos,
    percepcionesCentavos: compras.percepcionesCentavos,
    otrosCentavos: compras.otrosCentavos,
    totalCentavos: compras.totalCentavos,
    formaPago: compras.formaPago,
    pagadoCentavos: compras.pagadoCentavos,
    estado: compras.estado,
    regimenAlConfirmar: compras.regimenAlConfirmar,
    notas: compras.notas,
    creadoEn: compras.creadoEn,
    confirmadaEn: compras.confirmadaEn,
  };
}

export type ItemConProducto = CompraItem & { nombre: string; presentacion: string };

export async function obtenerCompra(
  id: string,
): Promise<(Compra & { proveedor: string; items: ItemConProducto[] }) | undefined> {
  const compra = await db
    .select({ ...columnasCompra(), proveedor: proveedores.nombre })
    .from(compras)
    .innerJoin(proveedores, eq(proveedores.id, compras.proveedorId))
    .where(eq(compras.id, id))
    .get();
  if (!compra) return undefined;

  const items = await db
    .select({
      id: compraItems.id,
      compraId: compraItems.compraId,
      productoId: compraItems.productoId,
      cantidad: compraItems.cantidad,
      costoUnitNetoCentavos: compraItems.costoUnitNetoCentavos,
      ivaAlicuota: compraItems.ivaAlicuota,
      ivaCentavos: compraItems.ivaCentavos,
      prorrateoCentavos: compraItems.prorrateoCentavos,
      costoRealUnitCentavos: compraItems.costoRealUnitCentavos,
      nombre: productos.nombre,
      presentacion: productos.presentacion,
    })
    .from(compraItems)
    .innerJoin(productos, eq(productos.id, compraItems.productoId))
    .where(eq(compraItems.compraId, id))
    .all();

  return { ...compra, items };
}

export type EstadoPago = "pagado" | "parcial" | "pendiente";

/** Se deduce del saldo: así no puede quedar marcada "pagada" con plata a deber. */
export function estadoPago(compra: Pick<Compra, "pagadoCentavos" | "totalCentavos">): EstadoPago {
  if (compra.pagadoCentavos >= compra.totalCentavos && compra.totalCentavos > 0) return "pagado";
  if (compra.pagadoCentavos > 0) return "parcial";
  return "pendiente";
}

export function saldoCompra(compra: Pick<Compra, "pagadoCentavos" | "totalCentavos">): number {
  return Math.max(0, compra.totalCentavos - compra.pagadoCentavos);
}

/** Historial de compras de un producto: qué se pagó cada vez y a quién. */
export async function historialDeProducto(productoId: string) {
  return db
    .select({
      compraId: compras.id,
      numero: compras.numero,
      fecha: compras.fecha,
      comprobante: compras.comprobante,
      proveedor: proveedores.nombre,
      cantidad: compraItems.cantidad,
      costoUnitNetoCentavos: compraItems.costoUnitNetoCentavos,
      costoRealUnitCentavos: compraItems.costoRealUnitCentavos,
      estado: compras.estado,
    })
    .from(compraItems)
    .innerJoin(compras, eq(compras.id, compraItems.compraId))
    .innerJoin(proveedores, eq(proveedores.id, compras.proveedorId))
    .where(and(eq(compraItems.productoId, productoId), eq(compras.estado, "confirmada")))
    .orderBy(desc(compras.fecha), desc(compras.numero))
    .all();
}

/** Lo que se le debe a cada proveedor por compras confirmadas. */
export async function cuentasPorPagar() {
  const filas = await db
    .select({
      proveedorId: proveedores.id,
      proveedor: proveedores.nombre,
      totalCentavos: sql<number>`coalesce(sum(${compras.totalCentavos}), 0)`,
      pagadoCentavos: sql<number>`coalesce(sum(${compras.pagadoCentavos}), 0)`,
    })
    .from(compras)
    .innerJoin(proveedores, eq(proveedores.id, compras.proveedorId))
    .where(eq(compras.estado, "confirmada"))
    .groupBy(proveedores.id)
    .all();

  return filas
    .map((f) => ({ ...f, saldoCentavos: f.totalCentavos - f.pagadoCentavos }))
    .filter((f) => f.saldoCentavos > 0)
    .sort((a, b) => b.saldoCentavos - a.saldoCentavos);
}

// ---------- Alta y ciclo de vida ----------

export async function crearCompra(datos: {
  proveedorId: string;
  fecha: string;
  comprobante?: string;
  formaPago?: string;
  percepcionesCentavos?: number;
  otrosCentavos?: number;
  notas?: string;
  items: RenglonCrudo[];
}): Promise<string> {
  const items = datos.items.filter((i) => i.cantidad > 0);
  if (items.length === 0) throw new ErrorCompra("La compra no tiene renglones con cantidad.");
  if (!datos.proveedorId) throw new ErrorCompra("Elegí a qué proveedor le compraste.");
  for (const i of items) {
    if (!Number.isInteger(i.cantidad)) throw new ErrorCompra("Las cantidades tienen que ser enteras.");
    if (i.costoUnitNetoCentavos < 0) throw new ErrorCompra("El costo no puede ser negativo.");
  }

  const ids = [...new Set(items.map((i) => i.productoId))];
  const lista = await db.select({ id: productos.id }).from(productos).where(inArray(productos.id, ids)).all();
  if (lista.length !== ids.length) throw new ErrorCompra("Hay un producto que ya no existe en el catálogo.");

  const regimen = await regimenActual();
  const calculo = calcularCompra(items, datos, regimen);

  const id = nuevoId();
  await db.transaction(async (tx) => {
    const ultimo = await tx.select({ n: sql<number>`coalesce(max(${compras.numero}), 0)` }).from(compras).get();
    await tx
      .insert(compras)
      .values({
        id,
        numero: (ultimo?.n ?? 0) + 1,
        proveedorId: datos.proveedorId,
        fecha: datos.fecha,
        comprobante: datos.comprobante?.trim() ?? "",
        netoCentavos: calculo.netoCentavos,
        ivaCentavos: calculo.ivaCentavos,
        percepcionesCentavos: calculo.percepcionesCentavos,
        otrosCentavos: calculo.otrosCentavos,
        totalCentavos: calculo.totalCentavos,
        formaPago: datos.formaPago ?? "transferencia",
        pagadoCentavos: 0,
        estado: "borrador",
        regimenAlConfirmar: "",
        notas: datos.notas?.trim() ?? "",
        creadoEn: ahora(),
      })
      .run();

    for (const r of calculo.renglones) {
      await tx
        .insert(compraItems)
        .values({
          id: nuevoId(),
          compraId: id,
          productoId: r.productoId,
          cantidad: r.cantidad,
          costoUnitNetoCentavos: r.costoUnitNetoCentavos,
          ivaAlicuota: r.ivaAlicuota,
          ivaCentavos: r.ivaCentavos,
          prorrateoCentavos: r.prorrateoCentavos,
          costoRealUnitCentavos: r.costoRealUnitCentavos,
        })
        .run();
    }
  });
  return id;
}

/**
 * Confirmar es el momento en que la compra existe para el negocio: entra la
 * mercadería al depósito con su movimiento y se recalcula el costo promedio de
 * cada producto. Antes de esto, un borrador a medio cargar no ensucia nada.
 */
export async function confirmarCompra(compraId: string): Promise<void> {
  const regimen = await regimenActual();

  await db.transaction(async (tx) => {
    const compra = await tx.select().from(compras).where(eq(compras.id, compraId)).get();
    if (!compra) throw new ErrorCompra("La compra no existe.");
    if (compra.estado === "confirmada") return;
    if (compra.estado === "anulada") throw new ErrorCompra("La compra está anulada: no se puede confirmar.");

    const items = await tx.select().from(compraItems).where(eq(compraItems.compraId, compraId)).all();
    if (items.length === 0) throw new ErrorCompra("La compra no tiene renglones.");

    for (const item of items) {
      // El stock previo se lee antes de mover: es la base del promedio.
      const producto = await tx.select().from(productos).where(eq(productos.id, item.productoId)).get();
      if (!producto) throw new ErrorCompra("Hay un producto que ya no existe en el catálogo.");

      await moverStock(tx, {
        productoId: item.productoId,
        tipo: "entrada",
        cantidad: item.cantidad,
        motivo: `Compra #${compra.numero}${compra.comprobante ? ` · ${compra.comprobante}` : ""}`,
        compraId: compra.id,
        fecha: compra.fecha,
        registradoPor: "Compras",
      });

      await tx
        .update(productos)
        .set({
          costoCentavos: promedioPonderado(
            producto.stock,
            producto.costoCentavos,
            item.cantidad,
            item.costoRealUnitCentavos,
          ),
          ultimoCostoCentavos: item.costoRealUnitCentavos,
        })
        .where(eq(productos.id, item.productoId))
        .run();
    }

    await tx
      .update(compras)
      .set({ estado: "confirmada", regimenAlConfirmar: regimen, confirmadaEn: ahora() })
      .where(eq(compras.id, compraId))
      .run();
  });
}

/**
 * Anular en vez de borrar: la compra queda a la vista con su historia. Devuelve
 * la mercadería y deshace el promedio ponderado con la cuenta inversa —exacta
 * mientras sea la última compra del producto, aproximada si hubo otras después.
 */
export async function anularCompra(compraId: string, motivo: string): Promise<void> {
  const razon = motivo.trim();
  if (!razon) throw new ErrorCompra("Una anulación necesita un motivo: sin eso el historial no sirve.");

  await db.transaction(async (tx) => {
    const compra = await tx.select().from(compras).where(eq(compras.id, compraId)).get();
    if (!compra) throw new ErrorCompra("La compra no existe.");
    if (compra.estado === "anulada") return;

    if (compra.estado === "confirmada") {
      const items = await tx.select().from(compraItems).where(eq(compraItems.compraId, compraId)).all();
      for (const item of items) {
        const producto = await tx.select().from(productos).where(eq(productos.id, item.productoId)).get();
        if (!producto) continue;

        const restante = producto.stock - item.cantidad;
        if (restante < 0) {
          throw new ErrorCompra(
            `No se puede anular: de ${producto.nombre} ya salieron unidades de esta compra. ` +
              `Hay ${producto.stock} en depósito y la compra trajo ${item.cantidad}.`,
          );
        }

        await moverStock(tx, {
          productoId: item.productoId,
          tipo: "ajuste",
          cantidad: -item.cantidad,
          motivo: `Compra #${compra.numero} anulada: ${razon}`,
          compraId: compra.id,
          fecha: compra.fecha,
          registradoPor: "Compras",
        });

        const costoRevertido =
          restante > 0
            ? Math.round(
                (producto.stock * producto.costoCentavos - item.cantidad * item.costoRealUnitCentavos) / restante,
              )
            : producto.costoCentavos;

        await tx
          .update(productos)
          // Un promedio no puede quedar negativo por redondeos: se piso en cero.
          .set({ costoCentavos: Math.max(0, costoRevertido) })
          .where(eq(productos.id, item.productoId))
          .run();
      }
    }

    await tx
      .update(compras)
      .set({ estado: "anulada", notas: [compra.notas, `Anulada: ${razon}`].filter(Boolean).join("\n") })
      .where(eq(compras.id, compraId))
      .run();
  });
}

export async function registrarPago(compraId: string, montoCentavos: number): Promise<void> {
  if (montoCentavos <= 0) throw new ErrorCompra("El pago tiene que ser mayor a cero.");

  await db.transaction(async (tx) => {
    const compra = await tx.select().from(compras).where(eq(compras.id, compraId)).get();
    if (!compra) throw new ErrorCompra("La compra no existe.");
    if (compra.estado === "anulada") throw new ErrorCompra("La compra está anulada.");

    const pagado = compra.pagadoCentavos + montoCentavos;
    if (pagado > compra.totalCentavos) {
      throw new ErrorCompra(
        `Ese pago se pasa del total: quedan ${((compra.totalCentavos - compra.pagadoCentavos) / 100).toFixed(2)} por pagar.`,
      );
    }
    await tx.update(compras).set({ pagadoCentavos: pagado }).where(eq(compras.id, compraId)).run();
  });
}

export async function eliminarBorrador(compraId: string): Promise<void> {
  const compra = await db.select().from(compras).where(eq(compras.id, compraId)).get();
  if (!compra) return;
  // Confirmada o anulada se conservan: solo un borrador se puede borrar de verdad.
  if (compra.estado !== "borrador") throw new ErrorCompra("Solo se pueden borrar los borradores. Anulá la compra.");
  await db.delete(compras).where(eq(compras.id, compraId)).run();
}
