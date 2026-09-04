import "server-only";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { compraItems, compras, pedidoItems, pedidos } from "../db/schema";
import { leerNumero, preciosConIva, regimenActual, type Regimen } from "./config";

export type Rango = { desde: string; hasta: string };

export type EstimacionImpuestos = {
  regimen: Regimen;
  aplica: boolean;
  ventaBrutaCentavos: number;
  ventaNetaCentavos: number;
  ivaDebitoCentavos: number;
  ivaCreditoCentavos: number;
  percepcionesCentavos: number;
  saldoIvaCentavos: number;
  alicuotaIIBB: number;
  iibbCentavos: number;
  reservaSugeridaCentavos: number;
};

/**
 * Estimador de impuestos: una herramienta de gestión para saber cuánta plata
 * conviene tener apartada, **no** una liquidación fiscal. No contempla saldos a
 * favor de períodos anteriores, retenciones sufridas ni exenciones.
 *
 * Solo tiene sentido para un Responsable Inscripto: un monotributista paga una
 * cuota fija y no liquida IVA, así que ahí devuelve `aplica: false`.
 */
export async function estimar(rango: Rango): Promise<EstimacionImpuestos> {
  const regimen = await regimenActual();
  const alicuotaVentas = await leerNumero("alicuotaVentas");
  const alicuotaIIBB = await leerNumero("alicuotaIIBB");
  const conIva = await preciosConIva();

  const venta = await db
    .select({
      total: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
    })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidos.id, pedidoItems.pedidoId))
    .where(and(eq(pedidos.estado, "entregado"), gte(pedidos.fecha, rango.desde), lte(pedidos.fecha, rango.hasta)))
    .get();

  const compra = await db
    .select({
      iva: sql<number>`coalesce(sum(${compras.ivaCentavos}), 0)`,
      percepciones: sql<number>`coalesce(sum(${compras.percepcionesCentavos}), 0)`,
    })
    .from(compras)
    .where(and(eq(compras.estado, "confirmada"), gte(compras.fecha, rango.desde), lte(compras.fecha, rango.hasta)))
    .get();

  const bruta = venta?.total ?? 0;
  // Si los precios ya llevan el IVA adentro, hay que sacarlo de adentro del
  // importe; si no, se calcula encima del neto.
  const neta = conIva ? Math.round(bruta / (1 + alicuotaVentas / 10000)) : bruta;
  const ivaDebito = conIva ? bruta - neta : Math.round((neta * alicuotaVentas) / 10000);

  const aplica = regimen === "responsable_inscripto";
  const ivaCredito = aplica ? (compra?.iva ?? 0) : 0;
  const percepciones = aplica ? (compra?.percepciones ?? 0) : 0;
  // Las percepciones sufridas son pago a cuenta: restan del saldo a ingresar.
  const saldoIva = aplica ? Math.max(0, ivaDebito - ivaCredito - percepciones) : 0;
  const iibb = alicuotaIIBB > 0 ? Math.round((neta * alicuotaIIBB) / 10000) : 0;

  return {
    regimen,
    aplica,
    ventaBrutaCentavos: bruta,
    ventaNetaCentavos: neta,
    ivaDebitoCentavos: aplica ? ivaDebito : 0,
    ivaCreditoCentavos: ivaCredito,
    percepcionesCentavos: percepciones,
    saldoIvaCentavos: saldoIva,
    alicuotaIIBB,
    iibbCentavos: iibb,
    reservaSugeridaCentavos: saldoIva + iibb,
  };
}

/** IVA de las compras confirmadas, renglón por renglón, para poder auditarlo. */
export async function ivaDeCompras(rango: Rango) {
  return db
    .select({
      numero: compras.numero,
      fecha: compras.fecha,
      comprobante: compras.comprobante,
      netoCentavos: compras.netoCentavos,
      ivaCentavos: compras.ivaCentavos,
      percepcionesCentavos: compras.percepcionesCentavos,
      renglones: sql<number>`count(${compraItems.id})`,
    })
    .from(compras)
    .leftJoin(compraItems, eq(compraItems.compraId, compras.id))
    .where(and(eq(compras.estado, "confirmada"), gte(compras.fecha, rango.desde), lte(compras.fecha, rango.hasta)))
    .groupBy(compras.id)
    .orderBy(compras.fecha)
    .all();
}
