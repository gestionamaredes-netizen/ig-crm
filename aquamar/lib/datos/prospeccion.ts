import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "../db";
import {
  ESTADOS_ABIERTOS,
  contactosProspecto,
  prospectos,
  type CanalContacto,
  type EstadoProspecto,
  type PrecisionGeo,
} from "../db/schema";
import { ahora, hoy, nuevoId } from "../formato";
import { crearCliente } from "./clientes";
import { CENTROS_LOCALIDAD, PAPELERAS_MATANZA } from "./papeleras-matanza";

export type Prospecto = typeof prospectos.$inferSelect;
export type ContactoProspecto = typeof contactosProspecto.$inferSelect;

export class ErrorProspecto extends Error {}

export async function listarProspectos(): Promise<Prospecto[]> {
  return db.select().from(prospectos).orderBy(asc(prospectos.localidad), asc(prospectos.comercio)).all();
}

export async function obtenerProspecto(id: string): Promise<Prospecto | undefined> {
  return db.select().from(prospectos).where(eq(prospectos.id, id)).get();
}

export async function listarContactos(prospectoId: string): Promise<ContactoProspecto[]> {
  return db
    .select()
    .from(contactosProspecto)
    .where(eq(contactosProspecto.prospectoId, prospectoId))
    .orderBy(desc(contactosProspecto.fecha), desc(contactosProspecto.creadoEn))
    .all();
}

/**
 * Carga el relevamiento de papeleras. Solo agrega lo que falta: el id de cada
 * ficha es un slug fijo, así que volver a importar después de sumar comercios a
 * la lista no pisa un teléfono corregido a mano ni revive un descartado.
 */
export async function sembrarRelevamiento(): Promise<number> {
  const existentes = new Set(
    (await db.select({ id: prospectos.id }).from(prospectos).all()).map((f) => f.id),
  );
  const nuevos = PAPELERAS_MATANZA.filter((p) => !existentes.has(p.id));
  if (nuevos.length === 0) return 0;

  const marca = ahora();
  await db
    .insert(prospectos)
    .values(
      nuevos.map((p) => {
        const centro = CENTROS_LOCALIDAD[p.localidad];
        return {
          ...p,
          // Sin geocodificar, el pin cae en el centro del barrio y así se avisa.
          lat: centro?.lat ?? null,
          lng: centro?.lng ?? null,
          precisionGeo: "localidad" as PrecisionGeo,
          estado: "sin contactar" as EstadoProspecto,
          prioridad: 2,
          verificado: false,
          persona: "",
          proximaAccion: "",
          proximaAccionFecha: null,
          ultimoContactoEn: null,
          clienteId: null,
          creadoEn: marca,
          actualizadoEn: marca,
        };
      }),
    )
    .run();
  return nuevos.length;
}

export type DatosProspecto = Partial<Omit<Prospecto, "id" | "creadoEn" | "actualizadoEn">>;

export async function crearProspecto(datos: DatosProspecto & { comercio: string }): Promise<string> {
  const comercio = datos.comercio.trim();
  if (!comercio) throw new ErrorProspecto("El prospecto necesita un nombre de comercio.");

  const localidad = (datos.localidad ?? "").trim();
  const centro = CENTROS_LOCALIDAD[localidad];
  const id = nuevoId();
  const marca = ahora();

  await db
    .insert(prospectos)
    .values({
      ...datos,
      id,
      comercio,
      localidad,
      lat: datos.lat ?? centro?.lat ?? null,
      lng: datos.lng ?? centro?.lng ?? null,
      precisionGeo: datos.lat != null ? "manual" : "localidad",
      creadoEn: marca,
      actualizadoEn: marca,
    })
    .run();
  return id;
}

export async function actualizarProspecto(id: string, datos: DatosProspecto): Promise<void> {
  await db
    .update(prospectos)
    .set({ ...datos, actualizadoEn: ahora() })
    .where(eq(prospectos.id, id))
    .run();
}

/**
 * Mueve el pin. `precision` distingue lo que resolvió el geocodificador de lo
 * que alguien corrigió mirando el mapa: una corrección a mano no se vuelve a
 * pisar cuando se geocodifica en lote.
 */
export async function guardarUbicacion(
  id: string,
  lat: number,
  lng: number,
  precision: PrecisionGeo = "direccion",
): Promise<void> {
  await db
    .update(prospectos)
    .set({ lat, lng, precisionGeo: precision, actualizadoEn: ahora() })
    .where(eq(prospectos.id, id))
    .run();
}

/**
 * Anota una visita, un llamado o un mensaje, y deja al prospecto en el estado
 * en que quedó. El historial y la ficha se escriben juntos: si se guardara solo
 * el estado, el tablero diría "interesado" sin poder explicar por qué.
 */
export async function registrarContacto(datos: {
  prospectoId: string;
  canal: CanalContacto;
  estado: EstadoProspecto;
  detalle?: string;
  fecha?: string;
  registradoPor?: string;
  proximaAccion?: string;
  proximaAccionFecha?: string | null;
}): Promise<void> {
  const prospecto = await obtenerProspecto(datos.prospectoId);
  if (!prospecto) throw new ErrorProspecto("No existe ese prospecto.");

  const fecha = datos.fecha ?? hoy();
  await db.transaction(async (tx) => {
    await tx
      .insert(contactosProspecto)
      .values({
        id: nuevoId(),
        prospectoId: datos.prospectoId,
        fecha,
        canal: datos.canal,
        estado: datos.estado,
        detalle: datos.detalle?.trim() ?? "",
        registradoPor: datos.registradoPor ?? "",
        creadoEn: ahora(),
      })
      .run();

    await tx
      .update(prospectos)
      .set({
        estado: datos.estado,
        ultimoContactoEn: fecha,
        proximaAccion: datos.proximaAccion?.trim() ?? "",
        proximaAccionFecha: datos.proximaAccionFecha || null,
        // Quien habló con el comercio confirmó de paso con quién se habla.
        verificado: true,
        actualizadoEn: ahora(),
      })
      .where(eq(prospectos.id, datos.prospectoId))
      .run();
  });
}

/**
 * El prospecto compró: pasa a ficha de cliente y queda apuntado desde acá. No
 * se borra de la prospección — el tablero necesita poder mostrar cuántos de los
 * relevados se convirtieron, que es la única medida real de que sirvió.
 */
export async function convertirEnCliente(id: string): Promise<string> {
  const prospecto = await obtenerProspecto(id);
  if (!prospecto) throw new ErrorProspecto("No existe ese prospecto.");
  if (prospecto.clienteId) throw new ErrorProspecto("Este prospecto ya tiene ficha de cliente.");

  const redes = [prospecto.instagram, prospecto.facebook].filter(Boolean).join(" · ");
  const clienteId = await crearCliente({
    comercio: prospecto.comercio,
    persona: prospecto.persona,
    telefono: prospecto.telefono || prospecto.whatsapp,
    direccion: [prospecto.direccion, prospecto.localidad].filter(Boolean).join(", "),
    email: prospecto.email,
    redes,
    notas: prospecto.notas,
  });

  await db
    .update(prospectos)
    .set({ clienteId, estado: "cliente", actualizadoEn: ahora() })
    .where(eq(prospectos.id, id))
    .run();
  return clienteId;
}

export type ResumenProspeccion = {
  total: number;
  porEstado: Record<string, number>;
  abiertos: number;
  clientes: number;
  sinContactar: number;
  /** Con próxima acción vencida o para hoy: lo que hay que hacer ya. */
  vencidos: number;
  /** Cuántos tienen al menos un teléfono o WhatsApp para arrancar. */
  conTelefono: number;
  porLocalidad: { localidad: string; total: number; clientes: number; abiertos: number }[];
};

export function resumir(filas: Prospecto[]): ResumenProspeccion {
  const porEstado: Record<string, number> = {};
  const porLocalidad = new Map<string, { total: number; clientes: number; abiertos: number }>();
  const limite = hoy();
  let vencidos = 0;
  let conTelefono = 0;

  for (const p of filas) {
    porEstado[p.estado] = (porEstado[p.estado] ?? 0) + 1;

    const abierto = ESTADOS_ABIERTOS.includes(p.estado);
    const loc = porLocalidad.get(p.localidad) ?? { total: 0, clientes: 0, abiertos: 0 };
    loc.total++;
    if (p.estado === "cliente") loc.clientes++;
    if (abierto) loc.abiertos++;
    porLocalidad.set(p.localidad, loc);

    if (p.proximaAccionFecha && p.proximaAccionFecha <= limite && abierto) vencidos++;
    if (p.telefono || p.whatsapp) conTelefono++;
  }

  return {
    total: filas.length,
    porEstado,
    abiertos: filas.filter((p) => ESTADOS_ABIERTOS.includes(p.estado)).length,
    clientes: porEstado["cliente"] ?? 0,
    sinContactar: porEstado["sin contactar"] ?? 0,
    vencidos,
    conTelefono,
    porLocalidad: [...porLocalidad.entries()]
      .map(([localidad, v]) => ({ localidad, ...v }))
      .sort((a, b) => b.total - a.total || a.localidad.localeCompare(b.localidad)),
  };
}
