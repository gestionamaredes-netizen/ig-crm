import "server-only";
import { and, desc, gte, lte } from "drizzle-orm";
import { db } from "../db";
import { bitacora } from "../db/schema";
import { ahora, hoy, nuevoId } from "../formato";

export type Anotacion = typeof bitacora.$inferSelect;

/**
 * Deja constancia de una decisión. Nunca falla hacia afuera: si la bitácora se
 * rompe, lo que no puede pasar es que se caiga la operación que la generó —
 * anotar es importante, pero menos que cobrar o mover stock.
 */
export async function anotar(datos: {
  actor: string;
  accion: string;
  entidad?: string;
  entidadId?: string | null;
  detalle?: string;
}): Promise<void> {
  try {
    await db
      .insert(bitacora)
      .values({
        id: nuevoId(),
        fecha: hoy(),
        actor: datos.actor,
        accion: datos.accion,
        entidad: datos.entidad ?? "",
        entidadId: datos.entidadId ?? null,
        detalle: datos.detalle ?? "",
        creadoEn: ahora(),
      })
      .run();
  } catch (error) {
    console.error("No se pudo anotar en la bitácora:", error);
  }
}

export async function listarBitacora(
  filtro: { desde?: string; hasta?: string; limite?: number } = {},
): Promise<Anotacion[]> {
  const condiciones = [];
  if (filtro.desde) condiciones.push(gte(bitacora.fecha, filtro.desde));
  if (filtro.hasta) condiciones.push(lte(bitacora.fecha, filtro.hasta));

  return db
    .select()
    .from(bitacora)
    .where(condiciones.length ? and(...condiciones) : undefined)
    .orderBy(desc(bitacora.creadoEn))
    .limit(filtro.limite ?? 200)
    .all();
}
