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

// ---------- Ajustes numéricos ----------

/**
 * Ajustes que son un número. Se guardan como texto en la misma tabla clave /
 * valor: un ajuste nuevo no necesita migrar el esquema.
 */
export const AJUSTES_NUMERICOS = {
  /** Alícuota de IVA de las ventas, en centésimos de punto. 2100 = 21%. */
  alicuotaVentas: 2100,
  /** Alícuota de Ingresos Brutos. En cero, el estimador no la calcula. */
  alicuotaIIBB: 0,
  /** Días de venta que se quieren tener cubiertos al sugerir una compra. */
  diasDeCobertura: 30,
} as const;

export type AjusteNumerico = keyof typeof AJUSTES_NUMERICOS;

export async function leerNumero(clave: AjusteNumerico): Promise<number> {
  const fila = await db.select().from(configuracion).where(eq(configuracion.clave, clave)).get();
  const valor = Number(fila?.valor);
  return Number.isFinite(valor) ? valor : AJUSTES_NUMERICOS[clave];
}

export async function guardarNumero(clave: AjusteNumerico, valor: number): Promise<void> {
  if (!Number.isFinite(valor) || valor < 0) return;
  await db
    .insert(configuracion)
    .values({ clave, valor: String(valor), actualizadoEn: ahora() })
    .onConflictDoUpdate({ target: configuracion.clave, set: { valor: String(valor), actualizadoEn: ahora() } })
    .run();
}

const CLAVE_PRECIOS_CON_IVA = "precios_con_iva";

/**
 * ¿Los precios de venta ya tienen el IVA adentro? Un mayorista que le cotiza a
 * un kiosco suele dar el precio final, así que arranca en que sí. Decide cómo
 * se separa el IVA débito del importe facturado.
 */
export async function preciosConIva(): Promise<boolean> {
  const fila = await db.select().from(configuracion).where(eq(configuracion.clave, CLAVE_PRECIOS_CON_IVA)).get();
  return fila ? fila.valor === "1" : true;
}

export async function guardarPreciosConIva(incluido: boolean): Promise<void> {
  const valor = incluido ? "1" : "0";
  await db
    .insert(configuracion)
    .values({ clave: CLAVE_PRECIOS_CON_IVA, valor, actualizadoEn: ahora() })
    .onConflictDoUpdate({ target: configuracion.clave, set: { valor, actualizadoEn: ahora() } })
    .run();
}
