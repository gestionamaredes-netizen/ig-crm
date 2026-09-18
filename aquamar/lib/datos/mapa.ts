import "server-only";
import { and, asc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { clientes, pedidoItems, pedidos } from "../db/schema";
import { ENCUADRE, LOCALIDADES, dispersarEnLocalidad, localidadEnTexto } from "../matanza";
import type { CordonId } from "../matanza";

/** Un comercio en el mapa. Uno por cada uno: la marca es por cliente. */
export type PuntoComercio = {
  id: string;
  comercio: string;
  compro: boolean;
  lat: number;
  lon: number;
  /** Si las coordenadas son de su dirección o el centro de la localidad. */
  exacto: boolean;
};

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
      lat: clientes.lat,
      lon: clientes.lon,
    })
    .from(clientes)
    .where(eq(clientes.activo, true))
    .orderBy(asc(clientes.comercio))
    .all();

  const porLocalidad = new Map<string, { id: string; comercio: string; lat: number | null; lon: number | null }[]>();
  let sinUbicar = 0;
  let deducibles = 0;
  for (const c of filas) {
    if (!c.localidad) {
      sinUbicar += 1;
      if (localidadEnTexto(c.direccion)) deducibles += 1;
      continue;
    }
    porLocalidad.set(c.localidad, [
      ...(porLocalidad.get(c.localidad) ?? []),
      { id: c.id, comercio: c.comercio, lat: c.lat, lon: c.lon },
    ]);
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
      /*
       * Sin coordenadas propias el comercio va al centro de su localidad, con
       * un pin punteado: entra igual al mapa, pero diciendo que es aproximado.
       */
      puntos: suyos.map((c, i) => {
        const exacto = c.lat !== null && c.lon !== null;
        const desvio = exacto ? { lat: 0, lon: 0 } : dispersarEnLocalidad(i);
        return {
          id: c.id,
          comercio: c.comercio,
          compro: porCliente.has(c.id),
          lat: (c.lat ?? l.lat) + desvio.lat,
          lon: (c.lon ?? l.lon) + desvio.lon,
          exacto,
        };
      }),
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


// ---------- Geocodificación ----------

export class ErrorGeocodificacion extends Error {}

/**
 * Le busca las coordenadas a un comercio a partir de su dirección, contra
 * Nominatim —el buscador de OpenStreetMap, el mismo que está debajo del mapa—.
 *
 * De a uno y no en lote, por dos motivos que empujan para el mismo lado: el
 * servicio es gratuito y pide no bombardearlo, y en Netlify cada pedido tiene
 * diez segundos para contestar. Veinte direcciones en una sola llamada se
 * cortan por la mitad y dejan medio trabajo hecho sin avisar.
 *
 * La búsqueda se acota al partido: "Rivadavia 1234" existe en media Argentina,
 * y una dirección resuelta en otra provincia ensucia el mapa que ve la fábrica
 * peor que una dirección sin resolver.
 */
export async function geocodificarComercio(clienteId: string): Promise<{ resuelto: boolean; comercio: string }> {
  const cliente = await db
    .select({
      id: clientes.id,
      comercio: clientes.comercio,
      direccion: clientes.direccion,
      localidad: clientes.localidad,
    })
    .from(clientes)
    .where(eq(clientes.id, clienteId))
    .get();
  if (!cliente) throw new ErrorGeocodificacion("Ese comercio no existe.");
  if (!cliente.direccion.trim()) return { resuelto: false, comercio: cliente.comercio };

  const consulta = [cliente.direccion, cliente.localidad, "La Matanza, Buenos Aires, Argentina"]
    .filter(Boolean)
    .join(", ");

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", consulta);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ar");

  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      headers: {
        // Nominatim exige identificarse; sin esto devuelve 403.
        "User-Agent": "AquaMar-Panel/1.0 (distribuidora Aqua Mar, La Matanza)",
        "Accept-Language": "es",
      },
      signal: AbortSignal.timeout(7000),
    });
  } catch {
    throw new ErrorGeocodificacion("No se pudo consultar el buscador de direcciones. Probá de nuevo en un rato.");
  }
  if (!respuesta.ok) {
    throw new ErrorGeocodificacion(`El buscador de direcciones respondió ${respuesta.status}. Probá más tarde.`);
  }

  const encontrados = (await respuesta.json()) as { lat: string; lon: string }[];
  const primero = encontrados[0];
  if (!primero) return { resuelto: false, comercio: cliente.comercio };

  const lat = Number(primero.lat);
  const lon = Number(primero.lon);
  // Fuera del partido no se guarda: es una dirección homónima de otro lado.
  if (!dentroDelPartido(lat, lon)) return { resuelto: false, comercio: cliente.comercio };

  await db.update(clientes).set({ lat, lon }).where(eq(clientes.id, clienteId)).run();
  return { resuelto: true, comercio: cliente.comercio };
}

export function dentroDelPartido(lat: number, lon: number): boolean {
  const [[surLat, oesteLon], [norteLat, esteLon]] = ENCUADRE.limites;
  return lat >= surLat && lat <= norteLat && lon >= oesteLon && lon <= esteLon;
}

/** El próximo comercio al que le falta ubicación exacta, si queda alguno. */
export async function proximoSinCoordenadas(): Promise<{ id: string; comercio: string } | null> {
  const fila = await db
    .select({ id: clientes.id, comercio: clientes.comercio })
    .from(clientes)
    .where(and(eq(clientes.activo, true), sql`${clientes.lat} is null`, sql`${clientes.direccion} <> ''`))
    .orderBy(asc(clientes.comercio))
    .get();
  return fila ?? null;
}
