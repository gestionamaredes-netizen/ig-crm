import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { categoriasGasto, gastos, pedidos } from "../db/schema";
import { ahora, nuevoId } from "../formato";

export type CategoriaGasto = typeof categoriasGasto.$inferSelect;
export type Gasto = typeof gastos.$inferSelect;
export type GastoConCategoria = Gasto & { categoria: string; tipo: string; numeroPedido: number | null };

export class ErrorGasto extends Error {}

export function listarCategorias(soloActivas = false): CategoriaGasto[] {
  const filas = db.select().from(categoriasGasto).orderBy(asc(categoriasGasto.nombre)).all();
  return soloActivas ? filas.filter((c) => c.activo) : filas;
}

/**
 * Las categorías las agrega el administrador desde el panel. Si el nombre ya
 * existe se reutiliza (y se reactiva) en vez de fallar por el índice único.
 */
export function crearCategoria(nombre: string, tipo: "operativo" | "logistico" = "operativo"): string {
  const limpio = nombre.trim();
  if (!limpio) throw new ErrorGasto("La categoría necesita un nombre.");

  const existente = db.select().from(categoriasGasto).where(eq(categoriasGasto.nombre, limpio)).get();
  if (existente) {
    if (!existente.activo) db.update(categoriasGasto).set({ activo: true }).where(eq(categoriasGasto.id, existente.id)).run();
    return existente.id;
  }

  const id = nuevoId();
  db.insert(categoriasGasto).values({ id, nombre: limpio, tipo, activo: true, creadoEn: ahora() }).run();
  return id;
}

export function cambiarEstadoCategoria(id: string, activo: boolean): void {
  db.update(categoriasGasto).set({ activo }).where(eq(categoriasGasto.id, id)).run();
}

export function listarGastos(filtro: { desde?: string; hasta?: string; pedidoId?: string } = {}): GastoConCategoria[] {
  const condiciones = [];
  if (filtro.desde) condiciones.push(gte(gastos.fecha, filtro.desde));
  if (filtro.hasta) condiciones.push(lte(gastos.fecha, filtro.hasta));
  if (filtro.pedidoId) condiciones.push(eq(gastos.pedidoId, filtro.pedidoId));

  return db
    .select({
      id: gastos.id,
      categoriaId: gastos.categoriaId,
      fecha: gastos.fecha,
      montoCentavos: gastos.montoCentavos,
      descripcion: gastos.descripcion,
      pedidoId: gastos.pedidoId,
      creadoEn: gastos.creadoEn,
      categoria: categoriasGasto.nombre,
      tipo: categoriasGasto.tipo,
      numeroPedido: pedidos.numero,
    })
    .from(gastos)
    .innerJoin(categoriasGasto, eq(categoriasGasto.id, gastos.categoriaId))
    .leftJoin(pedidos, eq(pedidos.id, gastos.pedidoId))
    .where(condiciones.length ? and(...condiciones) : undefined)
    .orderBy(desc(gastos.fecha), desc(gastos.creadoEn))
    .all();
}

export function crearGasto(datos: {
  categoriaId: string;
  fecha: string;
  montoCentavos: number;
  descripcion?: string;
  pedidoId?: string | null;
}): string {
  const categoria = db.select().from(categoriasGasto).where(eq(categoriasGasto.id, datos.categoriaId)).get();
  if (!categoria) throw new ErrorGasto("Elegí una categoría válida.");
  if (!Number.isInteger(datos.montoCentavos) || datos.montoCentavos <= 0) {
    throw new ErrorGasto("El monto tiene que ser mayor a cero.");
  }
  if (datos.pedidoId) {
    const pedido = db.select({ id: pedidos.id }).from(pedidos).where(eq(pedidos.id, datos.pedidoId)).get();
    if (!pedido) throw new ErrorGasto("El pedido asociado no existe.");
  }

  const id = nuevoId();
  db.insert(gastos)
    .values({
      id,
      categoriaId: datos.categoriaId,
      fecha: datos.fecha,
      montoCentavos: datos.montoCentavos,
      descripcion: datos.descripcion ?? "",
      pedidoId: datos.pedidoId ?? null,
      creadoEn: ahora(),
    })
    .run();
  return id;
}

export function eliminarGasto(id: string): void {
  db.delete(gastos).where(eq(gastos.id, id)).run();
}

export function totalGastos(filtro: { desde?: string; hasta?: string } = {}): number {
  const condiciones = [];
  if (filtro.desde) condiciones.push(gte(gastos.fecha, filtro.desde));
  if (filtro.hasta) condiciones.push(lte(gastos.fecha, filtro.hasta));

  const fila = db
    .select({ total: sql<number>`coalesce(sum(${gastos.montoCentavos}), 0)` })
    .from(gastos)
    .where(condiciones.length ? and(...condiciones) : undefined)
    .get();
  return fila?.total ?? 0;
}
