import "server-only";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { movimientosCaja } from "../db/schema";
import type { MedioPago } from "../db/schema";
import { ahora, hoy, nuevoId } from "../formato";

export type MovimientoCaja = typeof movimientosCaja.$inferSelect;

export class ErrorCaja extends Error {}

type Ejecutor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export type DatosMovimientoCaja = {
  /** Con signo: positivo entra, negativo sale. */
  montoCentavos: number;
  medio: MedioPago;
  concepto: string;
  /** Cómo se pagó: efectivo, transferencia, Mercado Pago… */
  forma?: string;
  fecha?: string;
  pedidoId?: string | null;
  compraId?: string | null;
  gastoId?: string | null;
};

/**
 * Única puerta de entrada al libro de caja. Los cobros, los pagos a proveedores
 * y los gastos la llaman desde adentro de su transacción, así el saldo no puede
 * quedar contando una cosa que no pasó.
 */
export async function registrarMovimiento(ejecutor: Ejecutor, datos: DatosMovimientoCaja): Promise<string> {
  if (!Number.isInteger(datos.montoCentavos) || datos.montoCentavos === 0) {
    throw new ErrorCaja("El movimiento de caja tiene que ser un importe distinto de cero.");
  }
  const id = nuevoId();
  await ejecutor
    .insert(movimientosCaja)
    .values({
      id,
      fecha: datos.fecha ?? hoy(),
      medio: datos.medio,
      montoCentavos: datos.montoCentavos,
      concepto: datos.concepto,
      forma: datos.forma ?? "",
      pedidoId: datos.pedidoId ?? null,
      compraId: datos.compraId ?? null,
      gastoId: datos.gastoId ?? null,
      creadoEn: ahora(),
    })
    .run();
  return id;
}

/** Movimiento cargado a mano: saldo inicial, un retiro, una diferencia de arqueo. */
export async function registrarManual(datos: {
  montoCentavos: number;
  medio: MedioPago;
  concepto: string;
  fecha?: string;
}): Promise<void> {
  if (!datos.concepto.trim()) throw new ErrorCaja("Un movimiento a mano necesita un concepto.");
  await registrarMovimiento(db, { ...datos, concepto: datos.concepto.trim() });
}

/**
 * Pase entre efectivo y banco: son dos movimientos, no uno. Un depósito no
 * cambia cuánta plata hay, cambia dónde está.
 */
export async function transferir(datos: {
  desde: MedioPago;
  hacia: MedioPago;
  montoCentavos: number;
  fecha?: string;
}): Promise<void> {
  if (datos.desde === datos.hacia) throw new ErrorCaja("El origen y el destino son el mismo.");
  if (datos.montoCentavos <= 0) throw new ErrorCaja("El importe tiene que ser mayor a cero.");

  const nombre = (m: MedioPago) => (m === "efectivo" ? "efectivo" : "banco");
  const concepto = `Pase de ${nombre(datos.desde)} a ${nombre(datos.hacia)}`;

  await db.transaction(async (tx) => {
    await registrarMovimiento(tx, {
      montoCentavos: -datos.montoCentavos,
      medio: datos.desde,
      concepto,
      fecha: datos.fecha,
    });
    await registrarMovimiento(tx, {
      montoCentavos: datos.montoCentavos,
      medio: datos.hacia,
      concepto,
      fecha: datos.fecha,
    });
  });
}

export async function eliminarMovimiento(id: string): Promise<void> {
  const mov = await db.select().from(movimientosCaja).where(eq(movimientosCaja.id, id)).get();
  if (!mov) return;
  // Los que nacieron de un cobro, un pago o un gasto se deshacen desde ahí.
  if (mov.pedidoId || mov.compraId || mov.gastoId) {
    throw new ErrorCaja("Este movimiento vino de un cobro, un pago o un gasto: deshacelo desde ahí.");
  }
  await db.delete(movimientosCaja).where(eq(movimientosCaja.id, id)).run();
}

/** Borra los movimientos que había generado un gasto, al eliminarlo. */
export async function borrarPorGasto(ejecutor: Ejecutor, gastoId: string): Promise<void> {
  await ejecutor.delete(movimientosCaja).where(eq(movimientosCaja.gastoId, gastoId)).run();
}

// ---------- Consultas ----------

export async function listarMovimientos(
  filtro: { desde?: string; hasta?: string; medio?: MedioPago; limite?: number } = {},
): Promise<MovimientoCaja[]> {
  const condiciones = [];
  if (filtro.desde) condiciones.push(gte(movimientosCaja.fecha, filtro.desde));
  if (filtro.hasta) condiciones.push(lte(movimientosCaja.fecha, filtro.hasta));
  if (filtro.medio) condiciones.push(eq(movimientosCaja.medio, filtro.medio));

  return db
    .select()
    .from(movimientosCaja)
    .where(condiciones.length ? and(...condiciones) : undefined)
    .orderBy(desc(movimientosCaja.fecha), desc(movimientosCaja.creadoEn))
    .limit(filtro.limite ?? 200)
    .all();
}

export type Saldos = { efectivo: number; banco: number; total: number };

/**
 * Saldo actual: la suma de todo el libro. No hay un campo guardado que pueda
 * desfasarse — si los movimientos están bien, el saldo está bien.
 */
export async function saldos(hasta?: string): Promise<Saldos> {
  const filas = await db
    .select({
      medio: movimientosCaja.medio,
      total: sql<number>`coalesce(sum(${movimientosCaja.montoCentavos}), 0)`,
    })
    .from(movimientosCaja)
    .where(hasta ? lte(movimientosCaja.fecha, hasta) : undefined)
    .groupBy(movimientosCaja.medio)
    .all();

  const efectivo = filas.find((f) => f.medio === "efectivo")?.total ?? 0;
  const banco = filas.find((f) => f.medio === "banco")?.total ?? 0;
  return { efectivo, banco, total: efectivo + banco };
}

export type FlujoPeriodo = {
  ingresosCentavos: number;
  egresosCentavos: number;
  netoCentavos: number;
  saldoInicial: Saldos;
  saldoFinal: Saldos;
};

/** Qué entró, qué salió y con qué saldo se abrió y se cerró el período. */
export async function flujo(rango: { desde: string; hasta: string }): Promise<FlujoPeriodo> {
  const movimientos = await listarMovimientos({ ...rango, limite: 100000 });
  const ingresos = movimientos.filter((m) => m.montoCentavos > 0).reduce((a, m) => a + m.montoCentavos, 0);
  const egresos = movimientos.filter((m) => m.montoCentavos < 0).reduce((a, m) => a + m.montoCentavos, 0);

  const saldoFinal = await saldos(rango.hasta);
  const dia = new Date(`${rango.desde}T00:00:00Z`);
  dia.setUTCDate(dia.getUTCDate() - 1);
  const saldoInicial = await saldos(dia.toISOString().slice(0, 10));

  return {
    ingresosCentavos: ingresos,
    egresosCentavos: Math.abs(egresos),
    netoCentavos: ingresos + egresos,
    saldoInicial,
    saldoFinal,
  };
}

export type CobroPorForma = { forma: string; totalCentavos: number; cuantos: number };

/**
 * Cuánto entró por cada forma de cobro en el período. Mira solo lo que suma:
 * los pagos a proveedores y los gastos salen por la misma caja pero no son
 * cobros.
 */
export async function cobrosPorForma(rango: { desde: string; hasta: string }): Promise<CobroPorForma[]> {
  const filas = await db
    .select({
      forma: movimientosCaja.forma,
      medio: movimientosCaja.medio,
      // Suma con signo: la anulación de un cobro se resta sola. Contar, en
      // cambio, cuenta cobros: una anulación no es un cobro más.
      totalCentavos: sql<number>`coalesce(sum(${movimientosCaja.montoCentavos}), 0)`,
      cuantos: sql<number>`count(case when ${movimientosCaja.montoCentavos} > 0 then 1 end)`,
    })
    .from(movimientosCaja)
    .where(
      and(
        gte(movimientosCaja.fecha, rango.desde),
        lte(movimientosCaja.fecha, rango.hasta),
        sql`${movimientosCaja.pedidoId} is not null`,
      ),
    )
    .groupBy(movimientosCaja.forma, movimientosCaja.medio)
    .all();

  return filas
    .map((f) => ({
      // Un cobro viejo puede no tener forma: se lo nombra por dónde cayó.
      forma: f.forma || (f.medio === "efectivo" ? "efectivo" : "banco"),
      totalCentavos: f.totalCentavos,
      cuantos: f.cuantos,
    }))
    // Una forma que quedó en cero —se cobró y se anuló— no es una forma de
    // cobro del período: mostrarla en $ 0 es contar algo que no pasó.
    .filter((f) => f.totalCentavos > 0)
    .sort((a, b) => b.totalCentavos - a.totalCentavos);
}
