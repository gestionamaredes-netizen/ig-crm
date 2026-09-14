"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NOMBRE_ROL, requerirAdmin, rolActual } from "@/lib/auth";
import { anotar } from "@/lib/datos/bitacora";
import {
  ErrorProspecto,
  actualizarProspecto,
  convertirEnCliente,
  crearProspecto,
  guardarUbicacion,
  registrarContacto,
  sembrarRelevamiento,
} from "@/lib/datos/prospeccion";
import {
  CANALES_CONTACTO,
  ESTADOS_PROSPECTO,
  type CanalContacto,
  type EstadoProspecto,
} from "@/lib/db/schema";

const RUTA = "/comercial/prospeccion";

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

function volverConError(ruta: string, mensaje: string): never {
  const separador = ruta.includes("?") ? "&" : "?";
  redirect(`${ruta}${separador}error=${encodeURIComponent(mensaje)}`);
}

async function quienEs(): Promise<string> {
  const rol = await rolActual();
  return rol ? NOMBRE_ROL[rol] : "";
}

function leerEstado(valor: string): EstadoProspecto {
  return (ESTADOS_PROSPECTO as readonly string[]).includes(valor)
    ? (valor as EstadoProspecto)
    : "sin contactar";
}

function leerCanal(valor: string): CanalContacto {
  return (CANALES_CONTACTO as readonly string[]).includes(valor) ? (valor as CanalContacto) : "visita";
}

/** Carga las papeleras relevadas que todavía no estén en la base. */
export async function accionImportarRelevamiento() {
  await requerirAdmin();
  const sumados = await sembrarRelevamiento();
  if (sumados > 0) {
    await anotar({
      actor: await quienEs(),
      accion: "Relevamiento de papeleras importado",
      entidad: "prospección",
      detalle: `${sumados} comercios sumados`,
    });
  }
  revalidatePath(RUTA);
  redirect(`${RUTA}?importados=${sumados}`);
}

export async function accionCrearProspecto(formData: FormData) {
  await requerirAdmin();
  const comercio = texto(formData, "comercio");
  if (!comercio) volverConError(RUTA, "El prospecto necesita un nombre de comercio.");

  const id = await crearProspecto({
    comercio,
    localidad: texto(formData, "localidad"),
    direccion: texto(formData, "direccion"),
    persona: texto(formData, "persona"),
    telefono: texto(formData, "telefono"),
    whatsapp: texto(formData, "whatsapp"),
    email: texto(formData, "email"),
    instagram: texto(formData, "instagram"),
    notas: texto(formData, "notas"),
    fuente: "Carga manual",
  });
  revalidatePath(RUTA);
  redirect(`${RUTA}/${id}`);
}

export async function accionGuardarFicha(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const comercio = texto(formData, "comercio");
  if (!id) volverConError(RUTA, "Falta el prospecto.");
  if (!comercio) volverConError(`${RUTA}/${id}`, "El prospecto necesita un nombre de comercio.");

  const prioridad = Number(texto(formData, "prioridad"));
  await actualizarProspecto(id, {
    comercio,
    localidad: texto(formData, "localidad"),
    direccion: texto(formData, "direccion"),
    persona: texto(formData, "persona"),
    telefono: texto(formData, "telefono"),
    whatsapp: texto(formData, "whatsapp"),
    email: texto(formData, "email"),
    web: texto(formData, "web"),
    instagram: texto(formData, "instagram"),
    facebook: texto(formData, "facebook"),
    horario: texto(formData, "horario"),
    notas: texto(formData, "notas"),
    prioridad: prioridad >= 1 && prioridad <= 3 ? prioridad : 2,
    verificado: formData.get("verificado") !== null,
  });
  revalidatePath(RUTA);
  revalidatePath(`${RUTA}/${id}`);
  redirect(`${RUTA}/${id}`);
}

/** Anota la visita o el mensaje y deja al prospecto donde quedó. */
export async function accionRegistrarContacto(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "prospectoId");
  if (!id) volverConError(RUTA, "Falta el prospecto.");

  try {
    await registrarContacto({
      prospectoId: id,
      canal: leerCanal(texto(formData, "canal")),
      estado: leerEstado(texto(formData, "estado")),
      detalle: texto(formData, "detalle"),
      fecha: texto(formData, "fecha") || undefined,
      registradoPor: await quienEs(),
      proximaAccion: texto(formData, "proximaAccion"),
      proximaAccionFecha: texto(formData, "proximaAccionFecha") || null,
    });
  } catch (error) {
    if (error instanceof ErrorProspecto) volverConError(`${RUTA}/${id}`, error.message);
    throw error;
  }

  revalidatePath(RUTA);
  revalidatePath(`${RUTA}/${id}`);
  redirect(`${RUTA}/${id}`);
}

/** Cambio de estado sin nota, desde la lista del tablero. */
export async function accionCambiarEstado(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  if (!id) volverConError(RUTA, "Falta el prospecto.");

  try {
    await registrarContacto({
      prospectoId: id,
      canal: "otro",
      estado: leerEstado(texto(formData, "estado")),
      detalle: "Estado cambiado desde el tablero",
      registradoPor: await quienEs(),
    });
  } catch (error) {
    if (error instanceof ErrorProspecto) volverConError(RUTA, error.message);
    throw error;
  }
  revalidatePath(RUTA);
  redirect(RUTA);
}

export async function accionConvertirEnCliente(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  if (!id) volverConError(RUTA, "Falta el prospecto.");

  let clienteId: string;
  try {
    clienteId = await convertirEnCliente(id);
  } catch (error) {
    if (error instanceof ErrorProspecto) volverConError(`${RUTA}/${id}`, error.message);
    throw error;
  }

  await anotar({
    actor: await quienEs(),
    accion: "Prospecto convertido en cliente",
    entidad: "prospecto",
    entidadId: id,
  });
  revalidatePath(RUTA);
  revalidatePath("/comercial/clientes");
  redirect(`/comercial/clientes/${clienteId}`);
}

/**
 * Guarda el punto que resolvió el geocodificador del navegador. Va sin
 * redirección: la llama el mapa mientras ubica las direcciones de a una.
 */
export async function accionGuardarUbicacion(id: string, lat: number, lng: number) {
  await requerirAdmin();
  if (!id || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
  await guardarUbicacion(id, lat, lng, "direccion");
  revalidatePath(RUTA);
}
