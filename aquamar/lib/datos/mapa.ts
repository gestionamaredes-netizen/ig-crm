import "server-only";
import { and, asc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { clientes, pedidoItems, pedidos } from "../db/schema";
import { LOCALIDADES, localidadEnTexto } from "../matanza";
import type { CordonId } from "../matanza";

/** Un comercio en el mapa. Uno por cada uno: la marca es por cliente. */
export type PuntoComercio = { id: string; comercio: string; compro: boolean };

export type CoberturaLocalidad = {
  localidad: string;
  cordon: CordonId;
  puntos: PuntoComercio[];
  comercios: number;
  /** Los que compraron al menos una vez en el período. */
  activos: number;
  pedidos: number;
  unidades: number;
  ventasCentavos: number;
};

export type Cobertura = {
  localidades: CoberturaLocalidad[];
  /** Comercios cargados que todavía no tienen localidad puesta. */
  sinUbicar: number;
  /** De esos, a cuántos se les puede deducir la localidad de la dirección. */
  deducibles: number;
};

/**
 * Qué tiene Aqua Mar en cada localidad del partido: cuántos comercios, cuántos
 * compraron en el período y cuánto se les vendió.
 *
 * Los comercios se cuentan todos los activos, hayan comprado o no en el
 * período: uno que compró en julio y no en agosto sigue siendo cobertura. Lo
 * que sí se mide por período es la venta.
 */
export async function cobertura(rango: { desde: string; hasta: string }): Promise<Cobertura> {
  const filas = await db
    .select({
      id: clientes.id,
      comercio: clientes.comercio,
      localidad: clientes.localidad,
      direccion: clientes.direccion,
    })
    .from(clientes)
    .where(eq(clientes.activo, true))
    .orderBy(asc(clientes.comercio))
    .all();

  const porLocalidad = new Map<string, { id: string; comercio: string }[]>();
  let sinUbicar = 0;
  let deducibles = 0;
  for (const c of filas) {
    if (!c.localidad) {
      sinUbicar += 1;
      if (localidadEnTexto(c.direccion)) deducibles += 1;
      continue;
    }
    porLocalidad.set(c.localidad, [...(porLocalidad.get(c.localidad) ?? []), { id: c.id, comercio: c.comercio }]);
  }

  const ids = [...porLocalidad.values()].flat().map((c) => c.id);
  const ventas = ids.length
    ? await db
        .select({
          clienteId: pedidos.clienteId,
          pedidos: sql<number>`count(distinct ${pedidos.id})`,
          unidades: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
          venta: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
        })
        .from(pedidos)
        .innerJoin(pedidoItems, eq(pedidoItems.pedidoId, pedidos.id))
        .where(
          and(
            inArray(pedidos.clienteId, ids),
            eq(pedidos.estado, "entregado"),
            gte(pedidos.fecha, rango.desde),
            lte(pedidos.fecha, rango.hasta),
          ),
        )
        .groupBy(pedidos.clienteId)
        .all()
    : [];

  const porCliente = new Map(ventas.map((v) => [v.clienteId, v]));

  const localidades = LOCALIDADES.map((l) => {
    const suyos = porLocalidad.get(l.nombre) ?? [];
    const conVenta = suyos.map((c) => porCliente.get(c.id)).filter((v) => v !== undefined);
    return {
      localidad: l.nombre,
      cordon: l.cordon,
      puntos: suyos.map((c) => ({ id: c.id, comercio: c.comercio, compro: porCliente.has(c.id) })),
      comercios: suyos.length,
      activos: conVenta.length,
      pedidos: conVenta.reduce((a, v) => a + v.pedidos, 0),
      unidades: conVenta.reduce((a, v) => a + v.unidades, 0),
      ventasCentavos: conVenta.reduce((a, v) => a + v.venta, 0),
    };
  });

  return { localidades, sinUbicar, deducibles };
}

/**
 * Le pone localidad a los comercios que no la tienen, leyéndola de la
 * dirección. Solo toca los que están vacíos y solo cuando el nombre aparece
 * escrito: lo que no se puede deducir queda para cargar a mano.
 */
export async function ubicarPorDireccion(): Promise<{ ubicados: number }> {
  const filas = await db
    .select({ id: clientes.id, direccion: clientes.direccion })
    .from(clientes)
    .where(eq(clientes.localidad, ""))
    .all();

  let ubicados = 0;
  for (const c of filas) {
    const localidad = localidadEnTexto(c.direccion);
    if (!localidad) continue;
    await db.update(clientes).set({ localidad }).where(eq(clientes.id, c.id)).run();
    ubicados += 1;
  }
  return { ubicados };
}
