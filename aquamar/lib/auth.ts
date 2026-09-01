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

export function galletaAdmin(): string {
  return firmar("admin");
}

export async function esAdmin(): Promise<boolean> {
  const valor = (await cookies()).get(COOKIE_ADMIN)?.value;
  return !!valor && iguales(valor, galletaAdmin());
}

export async function requerirAdmin(): Promise<void> {
  if (!(await esAdmin())) redirect("/login");
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
