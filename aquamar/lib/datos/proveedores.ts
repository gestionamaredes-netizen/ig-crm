import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { proveedores } from "../db/schema";
import { ahora, nuevoId } from "../formato";

export type Proveedor = typeof proveedores.$inferSelect;

export class ErrorProveedor extends Error {}

export async function listarProveedores(soloActivos = false): Promise<Proveedor[]> {
  const filas = await db.select().from(proveedores).orderBy(asc(proveedores.nombre)).all();
  return soloActivos ? filas.filter((p) => p.activo) : filas;
}

export async function obtenerProveedor(id: string): Promise<Proveedor | undefined> {
  return db.select().from(proveedores).where(eq(proveedores.id, id)).get();
}

export async function crearProveedor(datos: {
  nombre: string;
  cuit?: string;
  condicionFiscal?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
}): Promise<string> {
  const nombre = datos.nombre.trim();
  if (!nombre) throw new ErrorProveedor("El proveedor necesita un nombre.");

  const id = nuevoId();
  await db
    .insert(proveedores)
    .values({
      id,
      nombre,
      cuit: datos.cuit?.trim() ?? "",
      condicionFiscal: datos.condicionFiscal?.trim() ?? "",
      telefono: datos.telefono?.trim() ?? "",
      email: datos.email?.trim() ?? "",
      direccion: datos.direccion?.trim() ?? "",
      notas: datos.notas?.trim() ?? "",
      activo: true,
      creadoEn: ahora(),
    })
    .run();
  return id;
}

export async function actualizarProveedor(
  id: string,
  datos: Partial<Omit<Proveedor, "id" | "creadoEn">>,
): Promise<void> {
  await db.update(proveedores).set(datos).where(eq(proveedores.id, id)).run();
}
