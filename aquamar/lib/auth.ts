import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { accesos, clientes } from "./db/schema";
import { ahora } from "./formato";

export const COOKIE_ADMIN = "am_admin";
export const COOKIE_ACCESO = "am_acceso";

const SECRETO = process.env.APP_SECRET ?? "aquamar-dev-secret";
const CLAVE_ADMIN = process.env.ADMIN_PASSWORD ?? "aquamar";
/**
 * Clave del depósito. Si no se define, no hay usuario de depósito: es mejor que
 * la puerta no exista a que exista con una clave de fábrica que nadie cambió.
 */
const CLAVE_DEPOSITO = process.env.DEPOSITO_PASSWORD ?? "";

export const ROLES = ["admin", "deposito"] as const;
export type Rol = (typeof ROLES)[number];

function firmar(valor: string): string {
  return createHmac("sha256", SECRETO).update(valor).digest("hex");
}

function iguales(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function claveAdminCorrecta(clave: string): boolean {
  return iguales(clave, CLAVE_ADMIN);
}

/**
 * Qué rol abre esa clave. La de administración se prueba primero: si alguien
 * pusiera la misma clave en las dos variables, gana el acceso completo.
 */
export function rolDeClave(clave: string): Rol | null {
  if (iguales(clave, CLAVE_ADMIN)) return "admin";
  if (CLAVE_DEPOSITO && iguales(clave, CLAVE_DEPOSITO)) return "deposito";
  return null;
}

export function hayUsuarioDeposito(): boolean {
  return CLAVE_DEPOSITO !== "";
}

/** La cookie lleva el rol firmado: sin la firma no se puede inventar uno. */
export function galletaDeRol(rol: Rol): string {
  return `${rol}.${firmar(rol)}`;
}

export async function rolActual(): Promise<Rol | null> {
  const valor = (await cookies()).get(COOKIE_ADMIN)?.value;
  if (!valor) return null;

  // Formato viejo, sin rol: una sesión abierta antes de que existieran los
  // permisos sigue siendo de administración hasta que se vuelva a entrar.
  if (iguales(valor, firmar("admin"))) return "admin";

  const [rol] = valor.split(".");
  return ROLES.includes(rol as Rol) && iguales(valor, galletaDeRol(rol as Rol)) ? (rol as Rol) : null;
}

export async function esAdmin(): Promise<boolean> {
  return (await rolActual()) === "admin";
}

/** Cualquiera de los dos roles: sirve para las pantallas del depósito. */
export async function esDelEquipo(): Promise<boolean> {
  return (await rolActual()) !== null;
}

export async function requerirAdmin(): Promise<void> {
  if (!(await esAdmin())) redirect("/login");
}

/** Deja pasar al depósito y también a la administración, que ve todo. */
export async function requerirEquipo(): Promise<Rol> {
  const rol = await rolActual();
  if (!rol) redirect("/login");
  return rol;
}

/**
 * ¿Puede ver plata? El depósito cuenta mercadería: los costos, los precios y
 * los márgenes no son asunto suyo.
 */
export async function puedeVerPlata(): Promise<boolean> {
  return (await rolActual()) === "admin";
}

export type SesionAcceso = {
  accesoId: string;
  nombre: string;
  rol: string;
  clienteId: string;
  comercio: string;
};

/** Resuelve el link/cookie de un cliente o su representante. */
export async function buscarAcceso(token: string): Promise<SesionAcceso | null> {
  const fila = await db
    .select({
      accesoId: accesos.id,
      nombre: accesos.nombre,
      rol: accesos.rol,
      activo: accesos.activo,
      clienteId: clientes.id,
      comercio: clientes.comercio,
      clienteActivo: clientes.activo,
    })
    .from(accesos)
    .innerJoin(clientes, eq(clientes.id, accesos.clienteId))
    .where(eq(accesos.token, token))
    .get();

  if (!fila || !fila.activo || !fila.clienteActivo) return null;
  return {
    accesoId: fila.accesoId,
    nombre: fila.nombre,
    rol: fila.rol,
    clienteId: fila.clienteId,
    comercio: fila.comercio,
  };
}

export async function marcarAcceso(accesoId: string): Promise<void> {
  await db.update(accesos).set({ ultimoAccesoEn: ahora() }).where(eq(accesos.id, accesoId)).run();
}

export async function sesionCliente(): Promise<SesionAcceso | null> {
  const token = (await cookies()).get(COOKIE_ACCESO)?.value;
  return token ? buscarAcceso(token) : null;
}

export async function requerirCliente(): Promise<SesionAcceso> {
  const sesion = await sesionCliente();
  if (!sesion) redirect("/login");
  return sesion;
}
