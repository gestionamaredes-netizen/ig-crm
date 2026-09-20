import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PERSONAS } from "./datos";

export const COOKIE = "nexo_prospectos";

const SECRETO = process.env.APP_SECRET ?? "prospectos-dev-secret";
const CLAVE = process.env.EQUIPO_PASSWORD ?? "nexo";

export type Persona = (typeof PERSONAS)[number];

function firmar(valor: string): string {
  return createHmac("sha256", SECRETO).update(valor).digest("hex");
}

function iguales(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function claveCorrecta(clave: string): boolean {
  return iguales(clave, CLAVE);
}

export function esPersona(nombre: string): nombre is Persona {
  return (PERSONAS as readonly string[]).includes(nombre);
}

/**
 * La cookie lleva el nombre firmado. Así el servidor sabe quién edita sin
 * confiar en lo que mande el navegador: nadie puede firmar como otro.
 */
export function galleta(nombre: Persona): string {
  return `${nombre}.${firmar(nombre)}`;
}

export async function quienSoy(): Promise<Persona | null> {
  const valor = (await cookies()).get(COOKIE)?.value;
  if (!valor) return null;
  const nombre = valor.split(".")[0];
  return esPersona(nombre) && iguales(valor, galleta(nombre)) ? nombre : null;
}

export async function requerirSesion(): Promise<Persona> {
  const yo = await quienSoy();
  if (!yo) redirect("/login");
  return yo;
}
