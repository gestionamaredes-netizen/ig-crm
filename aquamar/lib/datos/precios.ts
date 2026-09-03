import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { escalasPrecio, productos } from "../db/schema";
import { ahora, nuevoId } from "../formato";

export type Escala = typeof escalasPrecio.$inferSelect;

export class ErrorPrecio extends Error {}

/**
 * Las escalas se ordenan por cantidad de corte: así `precioParaCantidad` puede
 * recorrerlas de menor a mayor y quedarse con la última que entra.
 */
export async function listarEscalas(productoId?: string): Promise<Escala[]> {
  return db
    .select()
    .from(escalasPrecio)
    .where(productoId ? eq(escalasPrecio.productoId, productoId) : undefined)
    .orderBy(asc(escalasPrecio.productoId), asc(escalasPrecio.desdeCantidad))
    .all();
}

export async function crearEscala(datos: {
  productoId: string;
  nombre: string;
  desdeCantidad: number;
  precioCentavos: number;
}): Promise<string> {
  const nombre = datos.nombre.trim();
  if (!nombre) throw new ErrorPrecio("Ponele un nombre a la escala (por ejemplo: +10 bultos).");
  if (!Number.isInteger(datos.desdeCantidad) || datos.desdeCantidad < 1) {
    throw new ErrorPrecio("La escala arranca desde una cantidad entera de 1 o más.");
  }
  if (datos.precioCentavos <= 0) throw new ErrorPrecio("El precio de la escala tiene que ser mayor a cero.");

  const existentes = await listarEscalas(datos.productoId);
  if (existentes.some((e) => e.desdeCantidad === datos.desdeCantidad && e.activo)) {
    throw new ErrorPrecio(`Ya hay una escala que arranca en ${datos.desdeCantidad}.`);
  }

  const id = nuevoId();
  await db
    .insert(escalasPrecio)
    .values({
      id,
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

/**
 * Precio que corresponde a esa cantidad: la escala activa de mayor corte que no
 * la supere. Si el producto no tiene escalas, manda el precio de lista.
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

/** Escalas de varios productos de una, para no pegarle a la base por renglón. */
export async function escalasPorProducto(ids: string[]): Promise<Map<string, EscalasDeProducto>> {
  const mapa = new Map<string, EscalasDeProducto>();
  if (ids.length === 0) return mapa;

  const lista = await db
    .select({ id: productos.id, precioCentavos: productos.precioCentavos })
    .from(productos)
    .where(inArray(productos.id, ids))
    .all();
  for (const p of lista) mapa.set(p.id, { precioLista: p.precioCentavos, escalas: [] });

  const filas = await db
    .select()
    .from(escalasPrecio)
    .where(inArray(escalasPrecio.productoId, ids))
    .orderBy(asc(escalasPrecio.desdeCantidad))
    .all();
  for (const e of filas) mapa.get(e.productoId)?.escalas.push(e);

  return mapa;
}
