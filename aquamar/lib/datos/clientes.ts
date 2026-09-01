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

export function listarClientes(): Cliente[] {
  return db.select().from(clientes).orderBy(asc(clientes.comercio)).all();
}

export function obtenerCliente(id: string): Cliente | undefined {
  return db.select().from(clientes).where(eq(clientes.id, id)).get();
}

/** Crea la ficha y, con ella, el link de acceso del dueño del comercio. */
export function crearCliente(datos: DatosCliente): string {
  const id = nuevoId();
  db.transaction((tx) => {
    tx.insert(clientes)
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

    tx.insert(accesos)
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

export function actualizarCliente(id: string, datos: Partial<Cliente>): void {
  db.update(clientes).set(datos).where(eq(clientes.id, id)).run();
}

export function listarAccesos(clienteId: string): Acceso[] {
  return db.select().from(accesos).where(eq(accesos.clienteId, clienteId)).orderBy(asc(accesos.creadoEn)).all();
}

/** Link extra para que un representante gestione los pedidos del comercio. */
export function crearAcceso(clienteId: string, nombre: string, rol = "representante"): string {
  const id = nuevoId();
  db.insert(accesos)
    .values({ id, clienteId, nombre, rol, token: nuevoToken(), activo: true, creadoEn: ahora() })
    .run();
  return id;
}

export function cambiarEstadoAcceso(id: string, activo: boolean): void {
  db.update(accesos).set({ activo }).where(eq(accesos.id, id)).run();
}

export function regenerarToken(id: string): void {
  db.update(accesos).set({ token: nuevoToken() }).where(eq(accesos.id, id)).run();
}
