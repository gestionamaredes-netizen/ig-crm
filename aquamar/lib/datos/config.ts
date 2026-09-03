import "server-only";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { configuracion } from "../db/schema";
import { ahora } from "../formato";

export const REGIMENES = ["responsable_inscripto", "monotributo"] as const;
export type Regimen = (typeof REGIMENES)[number];

export const NOMBRE_REGIMEN: Record<Regimen, string> = {
  responsable_inscripto: "Responsable Inscripto",
  monotributo: "Monotributo",
};

const CLAVE_REGIMEN = "regimen_fiscal";

/**
 * De qué régimen es el negocio. Decide si el IVA de una compra es crédito
 * fiscal (Responsable Inscripto: se recupera, no es costo) o plata perdida
 * (Monotributo: es costo como cualquier otro). Cambia el margen de todo.
 */
export async function regimenActual(): Promise<Regimen> {
  const fila = await db.select().from(configuracion).where(eq(configuracion.clave, CLAVE_REGIMEN)).get();
  const valor = fila?.valor as Regimen | undefined;
  return valor && REGIMENES.includes(valor) ? valor : "responsable_inscripto";
}

export async function guardarRegimen(regimen: Regimen): Promise<void> {
  if (!REGIMENES.includes(regimen)) return;
  await db
    .insert(configuracion)
    .values({ clave: CLAVE_REGIMEN, valor: regimen, actualizadoEn: ahora() })
    .onConflictDoUpdate({ target: configuracion.clave, set: { valor: regimen, actualizadoEn: ahora() } })
    .run();
}

/** ¿El IVA pagado en una compra se recupera, o queda adentro del costo? */
export function ivaEsRecuperable(regimen: Regimen): boolean {
  return regimen === "responsable_inscripto";
}
