import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { productos } from "../db/schema";
import { ahora, nuevoId } from "../formato";

export type Producto = typeof productos.$inferSelect;

export function listarProductos(soloActivos = false): Producto[] {
  const q = db.select().from(productos).orderBy(asc(productos.nombre));
  const filas = q.all();
  return soloActivos ? filas.filter((p) => p.activo) : filas;
}

export function obtenerProducto(id: string): Producto | undefined {
  return db.select().from(productos).where(eq(productos.id, id)).get();
}

export function crearProducto(datos: {
  nombre: string;
  presentacion?: string;
  stock?: number;
  costoCentavos?: number;
  precioCentavos?: number;
}): string {
  const id = nuevoId();
  db.insert(productos)
    .values({
      id,
      nombre: datos.nombre,
      presentacion: datos.presentacion ?? "",
      stock: datos.stock ?? 0,
      costoCentavos: datos.costoCentavos ?? 0,
      precioCentavos: datos.precioCentavos ?? 0,
      activo: true,
      creadoEn: ahora(),
    })
    .run();
  return id;
}

export function actualizarProducto(
  id: string,
  datos: Partial<Pick<Producto, "nombre" | "presentacion" | "stock" | "costoCentavos" | "precioCentavos" | "activo">>,
): void {
  db.update(productos).set(datos).where(eq(productos.id, id)).run();
}

/** Suma (o resta, con delta negativo) unidades al stock del mayorista. */
export function ajustarStock(id: string, delta: number): void {
  db.update(productos)
    .set({ stock: sql`${productos.stock} + ${delta}` })
    .where(eq(productos.id, id))
    .run();
}

export function margenUnitario(p: Producto): number {
  return p.precioCentavos - p.costoCentavos;
}

export function margenPorcentual(p: Producto): number | null {
  if (p.precioCentavos <= 0) return null;
  return (margenUnitario(p) / p.precioCentavos) * 100;
}
