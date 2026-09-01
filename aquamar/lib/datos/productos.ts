import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { productos } from "../db/schema";
import { ahora, nuevoId } from "../formato";
import { moverStock } from "./stock";

export type Producto = typeof productos.$inferSelect;

export async function listarProductos(soloActivos = false): Promise<Producto[]> {
  const filas = await db.select().from(productos).orderBy(asc(productos.nombre)).all();
  return soloActivos ? filas.filter((p) => p.activo) : filas;
}

export async function obtenerProducto(id: string): Promise<Producto | undefined> {
  return db.select().from(productos).where(eq(productos.id, id)).get();
}

/**
 * El producto nace con stock cero y, si se declara existencia inicial, entra al
 * depósito como un movimiento más: así el libro explica hasta la primera unidad.
 */
export async function crearProducto(datos: {
  nombre: string;
  presentacion?: string;
  stock?: number;
  stockMinimo?: number;
  costoCentavos?: number;
  precioCentavos?: number;
}): Promise<string> {
  const id = nuevoId();
  await db.transaction(async (tx) => {
    await tx.insert(productos)
      .values({
        id,
        nombre: datos.nombre,
        presentacion: datos.presentacion ?? "",
        stock: 0,
        stockMinimo: datos.stockMinimo ?? 0,
        costoCentavos: datos.costoCentavos ?? 0,
        precioCentavos: datos.precioCentavos ?? 0,
        activo: true,
        creadoEn: ahora(),
      })
      .run();

    if (datos.stock && datos.stock > 0) {
      await moverStock(tx, {
        productoId: id,
        tipo: "entrada",
        cantidad: datos.stock,
        motivo: "Existencia inicial",
      });
    }
  });
  return id;
}

/**
 * Datos de catálogo. El stock queda afuera a propósito: se mueve con entradas y
 * ajustes, que dejan rastro en el libro del depósito.
 */
export async function actualizarProducto(
  id: string,
  datos: Partial<
    Pick<Producto, "nombre" | "presentacion" | "stockMinimo" | "costoCentavos" | "precioCentavos" | "activo">
  >,
): Promise<void> {
  await db.update(productos).set(datos).where(eq(productos.id, id)).run();
}

export function margenUnitario(p: Producto): number {
  return p.precioCentavos - p.costoCentavos;
}

export function margenPorcentual(p: Producto): number | null {
  if (p.precioCentavos <= 0) return null;
  return (margenUnitario(p) / p.precioCentavos) * 100;
}
