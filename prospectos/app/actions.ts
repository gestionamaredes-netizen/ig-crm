"use server";
import { revalidatePath } from "next/cache";
import { requerirSesion } from "@/lib/auth";
import { EQUIPO, PROSPECTOS, RUBROS_LIBRES } from "@/lib/listas";
import { agregar, esCampo, guardar, valorValido } from "@/lib/seguimiento";

export type Resultado = { ok: true } | { ok: false; error: string };

export async function guardarCampo(
  id: string, campo: string, valor: string,
): Promise<Resultado> {
  const yo = await requerirSesion();

  if (!esCampo(campo)) return { ok: false, error: "Ese campo no existe." };
  if (!valorValido(campo, valor)) return { ok: false, error: "Ese valor no es válido." };

  await guardar(id, campo, valor, yo);
  revalidatePath("/");
  return { ok: true };
}

export async function agregarProspecto(formData: FormData): Promise<Resultado> {
  const yo = await requerirSesion();

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return { ok: false, error: "Falta el nombre del negocio." };
  if (nombre.length > 80) return { ok: false, error: "El nombre es muy largo." };

  const texto = (k: string, max: number) =>
    String(formData.get(k) ?? "").trim().slice(0, max);

  const rubro = texto("rubro", 40);
  const localidad = texto("localidad", 40);
  if (!RUBROS_LIBRES.includes(rubro)) return { ok: false, error: "Rubro desconocido." };

  const base = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const id = `x-${base || "negocio"}-${Date.now().toString(36).slice(-4)}`;

  await agregar({
    id,
    nombre,
    rubro,
    localidad,
    instagram: texto("instagram", 60).replace(/^@/, ""),
    direccion: texto("direccion", 120),
    telefono: texto("telefono", 40),
    mail: texto("mail", 80),
    contenido: texto("contenido", 600),
    quien: yo,
  });
  revalidatePath("/");
  return { ok: true };
}

/** Sirve para que el cliente sepa a quién puede asignar sin repetir la lista. */
export async function equipo(): Promise<readonly string[]> {
  return EQUIPO;
}

export const TOTAL_BASE = PROSPECTOS.length;
