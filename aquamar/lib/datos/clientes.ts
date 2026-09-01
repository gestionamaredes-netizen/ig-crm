import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { accesos, clientes } from "../db/schema";
import { ahora, nuevoId, nuevoToken } from "../formato";

export type Cliente = typeof clientes.$inferSelect;
export type Acceso = typeof accesos.$inferSelect;

export type DatosCliente = {
  comercio: string;
  persona?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  redes?: string;
  notas?: string;
};

export async function listarClientes(): Promise<Cliente[]> {
  return db.select().from(clientes).orderBy(asc(clientes.comercio)).all();
}

export async function obtenerCliente(id: string): Promise<Cliente | undefined> {
  return db.select().from(clientes).where(eq(clientes.id, id)).get();
}

/** Crea la ficha y, con ella, el link de acceso del dueño del comercio. */
export async function crearCliente(datos: DatosCliente): Promise<string> {
  const id = nuevoId();
  await db.transaction(async (tx) => {
    await tx.insert(clientes)
      .values({
        id,
        comercio: datos.comercio,
        persona: datos.persona ?? "",
        telefono: datos.telefono ?? "",
        direccion: datos.direccion ?? "",
        email: datos.email ?? "",
        redes: datos.redes ?? "",
        notas: datos.notas ?? "",
        activo: true,
        creadoEn: ahora(),
      })
      .run();

    await tx.insert(accesos)
      .values({
        id: nuevoId(),
        clienteId: id,
        nombre: datos.persona?.trim() || datos.comercio,
        rol: "cliente",
        token: nuevoToken(),
        activo: true,
        creadoEn: ahora(),
      })
      .run();
  });
  return id;
}

export async function actualizarCliente(id: string, datos: Partial<Cliente>): Promise<void> {
  await db.update(clientes).set(datos).where(eq(clientes.id, id)).run();
}

export async function listarAccesos(clienteId: string): Promise<Acceso[]> {
  return db.select().from(accesos).where(eq(accesos.clienteId, clienteId)).orderBy(asc(accesos.creadoEn)).all();
}

/** Link extra para que un representante gestione los pedidos del comercio. */
export async function crearAcceso(clienteId: string, nombre: string, rol = "representante"): Promise<string> {
  const id = nuevoId();
  await db.insert(accesos)
    .values({ id, clienteId, nombre, rol, token: nuevoToken(), activo: true, creadoEn: ahora() })
    .run();
  return id;
}

export async function cambiarEstadoAcceso(id: string, activo: boolean): Promise<void> {
  await db.update(accesos).set({ activo }).where(eq(accesos.id, id)).run();
}

export async function regenerarToken(id: string): Promise<void> {
  await db.update(accesos).set({ token: nuevoToken() }).where(eq(accesos.id, id)).run();
}
