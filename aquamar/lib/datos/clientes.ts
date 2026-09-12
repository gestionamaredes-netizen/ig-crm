import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { accesos, clientes, pedidoItems, pedidos } from "../db/schema";
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
  razonSocial?: string;
  cuit?: string;
  condicionFiscal?: string;
  tipo?: string;
  listaPrecioId?: string | null;
  /** Quién lo atiende. Null es "lo atiende la casa". */
  vendedorId?: string | null;
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
        razonSocial: datos.razonSocial ?? "",
        cuit: datos.cuit ?? "",
        condicionFiscal: datos.condicionFiscal ?? "",
        tipo: datos.tipo ?? "comercio",
        listaPrecioId: datos.listaPrecioId ?? null,
        vendedorId: datos.vendedorId ?? null,
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

// ---------- Cómo compra cada comercio ----------

export type MetricasCliente = {
  pedidos: number;
  entregados: number;
  unidades: number;
  totalCompradoCentavos: number;
  saldoCentavos: number;
  ticketPromedioCentavos: number;
  primeraCompra: string | null;
  ultimaCompra: string | null;
  /** Días promedio entre pedidos. Null con menos de dos: no hay intervalo. */
  diasEntreCompras: number | null;
  /** Días desde el último pedido. Sirve para ver quién dejó de comprar. */
  diasSinComprar: number | null;
};

const VACIAS: MetricasCliente = {
  pedidos: 0, entregados: 0, unidades: 0, totalCompradoCentavos: 0, saldoCentavos: 0,
  ticketPromedioCentavos: 0, primeraCompra: null, ultimaCompra: null,
  diasEntreCompras: null, diasSinComprar: null,
};

function diasEntre(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86400000);
}

/**
 * Historia comercial del comercio: cuánto compró, cuánto debe, cada cuánto
 * vuelve. Los cancelados no cuentan como compra, y el saldo mira solo los
 * entregados: lo pendiente todavía no es plata a cobrar.
 */
export async function metricasDeCliente(clienteId: string, referencia: string): Promise<MetricasCliente> {
  const filas = await db
    .select({
      id: pedidos.id,
      fecha: pedidos.fecha,
      estado: pedidos.estado,
      cobradoCentavos: pedidos.cobradoCentavos,
      unidades: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
      totalCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
    })
    .from(pedidos)
    .leftJoin(pedidoItems, eq(pedidoItems.pedidoId, pedidos.id))
    .where(eq(pedidos.clienteId, clienteId))
    .groupBy(pedidos.id)
    .orderBy(asc(pedidos.fecha))
    .all();

  const validos = filas.filter((f) => f.estado !== "cancelado");
  if (validos.length === 0) return VACIAS;

  const entregados = validos.filter((f) => f.estado === "entregado");
  const total = validos.reduce((a, f) => a + f.totalCentavos, 0);
  const saldo = entregados.reduce((a, f) => a + Math.max(0, f.totalCentavos - f.cobradoCentavos), 0);
  const fechas = validos.map((f) => f.fecha);
  const primera = fechas[0];
  const ultima = fechas[fechas.length - 1];

  return {
    pedidos: validos.length,
    entregados: entregados.length,
    unidades: validos.reduce((a, f) => a + f.unidades, 0),
    totalCompradoCentavos: total,
    saldoCentavos: saldo,
    ticketPromedioCentavos: Math.round(total / validos.length),
    primeraCompra: primera,
    ultimaCompra: ultima,
    diasEntreCompras: validos.length > 1 ? Math.round(diasEntre(primera, ultima) / (validos.length - 1)) : null,
    diasSinComprar: diasEntre(ultima, referencia),
  };
}

export type ClienteConMetricas = Cliente & MetricasCliente;

/** Lo mismo para toda la cartera, para poder ordenar por quién compra más. */
export async function clientesConMetricas(referencia: string): Promise<ClienteConMetricas[]> {
  const lista = await listarClientes();
  return Promise.all(
    lista.map(async (c) => ({ ...c, ...(await metricasDeCliente(c.id, referencia)) })),
  );
}

/** Últimos pedidos del comercio, para la ficha. */
export async function historialDeCliente(clienteId: string, limite = 20) {
  return db
    .select({
      id: pedidos.id,
      numero: pedidos.numero,
      fecha: pedidos.fecha,
      estado: pedidos.estado,
      cobradoCentavos: pedidos.cobradoCentavos,
      unidades: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
      totalCentavos: sql<number>`coalesce(sum(${pedidoItems.cantidad} * ${pedidoItems.precioUnitCentavos}), 0)`,
    })
    .from(pedidos)
    .leftJoin(pedidoItems, eq(pedidoItems.pedidoId, pedidos.id))
    .where(eq(pedidos.clienteId, clienteId))
    .groupBy(pedidos.id)
    .orderBy(desc(pedidos.fecha), desc(pedidos.numero))
    .limit(limite)
    .all();
}
