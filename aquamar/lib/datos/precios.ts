import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { clientes, escalasPrecio, listasPrecio, productos } from "../db/schema";
import { ahora, nuevoId } from "../formato";

export type Escala = typeof escalasPrecio.$inferSelect;
export type ListaPrecio = typeof listasPrecio.$inferSelect;

export class ErrorPrecio extends Error {}

// ---------- Listas ----------

export async function listarListas(soloActivas = false): Promise<ListaPrecio[]> {
  const filas = await db.select().from(listasPrecio).orderBy(asc(listasPrecio.nombre)).all();
  return soloActivas ? filas.filter((l) => l.activo) : filas;
}

/** Siempre hay una: el arranque de la base la crea si falta. */
export async function listaPredeterminada(): Promise<ListaPrecio | undefined> {
  return (
    (await db.select().from(listasPrecio).where(eq(listasPrecio.predeterminada, true)).get()) ??
    (await db.select().from(listasPrecio).orderBy(asc(listasPrecio.creadoEn)).get())
  );
}

export async function crearLista(nombre: string): Promise<string> {
  const limpio = nombre.trim();
  if (!limpio) throw new ErrorPrecio("La lista necesita un nombre.");

  const id = nuevoId();
  await db
    .insert(listasPrecio)
    .values({ id, nombre: limpio, predeterminada: false, activo: true, creadoEn: ahora() })
    .run();
  return id;
}

export async function actualizarLista(
  id: string,
  datos: Partial<Pick<ListaPrecio, "nombre" | "activo">>,
): Promise<void> {
  await db.update(listasPrecio).set(datos).where(eq(listasPrecio.id, id)).run();
}

/** La predeterminada es una sola: marcar otra desmarca la anterior. */
export async function marcarPredeterminada(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(listasPrecio).set({ predeterminada: false }).run();
    await tx.update(listasPrecio).set({ predeterminada: true, activo: true }).where(eq(listasPrecio.id, id)).run();
  });
}

export async function eliminarLista(id: string): Promise<void> {
  const lista = await db.select().from(listasPrecio).where(eq(listasPrecio.id, id)).get();
  if (!lista) return;
  if (lista.predeterminada) throw new ErrorPrecio("No se puede borrar la lista predeterminada. Marcá otra primero.");

  const enUso = await db.select({ id: clientes.id }).from(clientes).where(eq(clientes.listaPrecioId, id)).get();
  if (enUso) throw new ErrorPrecio("Hay comercios con esta lista asignada. Cambiásela antes de borrarla.");

  await db.transaction(async (tx) => {
    await tx.delete(escalasPrecio).where(eq(escalasPrecio.listaId, id)).run();
    await tx.delete(listasPrecio).where(eq(listasPrecio.id, id)).run();
  });
}

// ---------- Escalas ----------

export async function listarEscalas(filtro: { listaId?: string; productoId?: string } = {}): Promise<Escala[]> {
  const condiciones = [];
  if (filtro.listaId) condiciones.push(eq(escalasPrecio.listaId, filtro.listaId));
  if (filtro.productoId) condiciones.push(eq(escalasPrecio.productoId, filtro.productoId));

  return db
    .select()
    .from(escalasPrecio)
    .where(condiciones.length ? and(...condiciones) : undefined)
    .orderBy(asc(escalasPrecio.productoId), asc(escalasPrecio.desdeCantidad))
    .all();
}

export async function crearEscala(datos: {
  listaId: string;
  productoId: string;
  nombre: string;
  desdeCantidad: number;
  precioCentavos: number;
}): Promise<string> {
  const nombre = datos.nombre.trim();
  if (!datos.listaId) throw new ErrorPrecio("Elegí a qué lista va la escala.");
  if (!nombre) throw new ErrorPrecio("Ponele un nombre a la escala (por ejemplo: +10 bultos).");
  if (!Number.isInteger(datos.desdeCantidad) || datos.desdeCantidad < 1) {
    throw new ErrorPrecio("La escala arranca desde una cantidad entera de 1 o más.");
  }
  if (datos.precioCentavos <= 0) throw new ErrorPrecio("El precio de la escala tiene que ser mayor a cero.");

  const existentes = await listarEscalas({ listaId: datos.listaId, productoId: datos.productoId });
  if (existentes.some((e) => e.desdeCantidad === datos.desdeCantidad && e.activo)) {
    throw new ErrorPrecio(`En esta lista ya hay una escala que arranca en ${datos.desdeCantidad}.`);
  }

  const id = nuevoId();
  await db
    .insert(escalasPrecio)
    .values({
      id,
      listaId: datos.listaId,
      productoId: datos.productoId,
      nombre,
      desdeCantidad: datos.desdeCantidad,
      precioCentavos: datos.precioCentavos,
      activo: true,
      creadoEn: ahora(),
    })
    .run();
  return id;
}

export async function actualizarEscala(
  id: string,
  datos: Partial<Pick<Escala, "nombre" | "desdeCantidad" | "precioCentavos" | "activo">>,
): Promise<void> {
  if (datos.precioCentavos !== undefined && datos.precioCentavos <= 0) {
    throw new ErrorPrecio("El precio de la escala tiene que ser mayor a cero.");
  }
  await db.update(escalasPrecio).set(datos).where(eq(escalasPrecio.id, id)).run();
}

export async function eliminarEscala(id: string): Promise<void> {
  await db.delete(escalasPrecio).where(eq(escalasPrecio.id, id)).run();
}

// ---------- Resolución de precio ----------

/**
 * Precio que corresponde a esa cantidad: la escala activa de mayor corte que no
 * la supere. Si el producto no tiene escalas en la lista, manda el de catálogo.
 */
export function precioParaCantidad(
  cantidad: number,
  precioLista: number,
  escalas: Pick<Escala, "desdeCantidad" | "precioCentavos" | "activo">[],
): number {
  let precio = precioLista;
  let corte = 0;
  for (const e of escalas) {
    if (!e.activo) continue;
    if (cantidad >= e.desdeCantidad && e.desdeCantidad >= corte) {
      corte = e.desdeCantidad;
      precio = e.precioCentavos;
    }
  }
  return precio;
}

export type EscalasDeProducto = { precioLista: number; escalas: Escala[] };

/**
 * Escalas de varios productos de una, para no pegarle a la base por renglón.
 * Sin `listaId` usa la predeterminada, que es lo que corresponde a un comercio
 * sin lista propia.
 */
export async function escalasPorProducto(
  ids: string[],
  listaId?: string | null,
): Promise<Map<string, EscalasDeProducto>> {
  const mapa = new Map<string, EscalasDeProducto>();
  if (ids.length === 0) return mapa;

  const lista = listaId ?? (await listaPredeterminada())?.id;

  const catalogo = await db
    .select({ id: productos.id, precioCentavos: productos.precioCentavos })
    .from(productos)
    .where(inArray(productos.id, ids))
    .all();
  for (const p of catalogo) mapa.set(p.id, { precioLista: p.precioCentavos, escalas: [] });
  if (!lista) return mapa;

  const filas = await db
    .select()
    .from(escalasPrecio)
    .where(and(inArray(escalasPrecio.productoId, ids), eq(escalasPrecio.listaId, lista)))
    .orderBy(asc(escalasPrecio.desdeCantidad))
    .all();
  for (const e of filas) mapa.get(e.productoId)?.escalas.push(e);

  return mapa;
}

/** La lista que le toca a un comercio: la suya, o la predeterminada. */
export async function listaDeCliente(clienteId: string): Promise<string | undefined> {
  const cliente = await db
    .select({ listaPrecioId: clientes.listaPrecioId })
    .from(clientes)
    .where(eq(clientes.id, clienteId))
    .get();
  return cliente?.listaPrecioId ?? (await listaPredeterminada())?.id;
}
