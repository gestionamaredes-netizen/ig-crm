import "server-only";
import { and, asc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { clientes, pedidos, vendedores } from "../db/schema";
import type { ModalidadVendedor } from "../db/schema";
import { MODALIDADES_VENDEDOR } from "../db/schema";
import { ahora, nuevoId } from "../formato";

export type Vendedor = typeof vendedores.$inferSelect;

export class ErrorVendedor extends Error {}

export async function listarVendedores(soloActivos = false): Promise<Vendedor[]> {
  const filas = await db.select().from(vendedores).orderBy(asc(vendedores.nombre)).all();
  return soloActivos ? filas.filter((v) => v.activo) : filas;
}

export async function obtenerVendedor(id: string): Promise<Vendedor | undefined> {
  if (!id) return undefined;
  return db.select().from(vendedores).where(eq(vendedores.id, id)).get();
}

export type DatosVendedor = {
  nombre: string;
  color?: string;
  modalidad?: ModalidadVendedor;
  comisionPorBultoCentavos?: number;
  listaPrecioId?: string | null;
  telefono?: string;
  notas?: string;
};

export async function crearVendedor(datos: DatosVendedor): Promise<string> {
  const nombre = datos.nombre.trim();
  if (!nombre) throw new ErrorVendedor("El vendedor necesita un nombre.");
  validar(datos);

  const id = nuevoId();
  await db
    .insert(vendedores)
    .values({
      id,
      nombre,
      color: datos.color || "azul",
      modalidad: datos.modalidad ?? "comisión",
      comisionPorBultoCentavos: datos.comisionPorBultoCentavos ?? 0,
      listaPrecioId: datos.listaPrecioId || null,
      telefono: datos.telefono?.trim() ?? "",
      notas: datos.notas?.trim() ?? "",
      activo: true,
      creadoEn: ahora(),
    })
    .run();
  return id;
}

export async function actualizarVendedor(id: string, datos: Partial<Vendedor>): Promise<void> {
  if (datos.nombre !== undefined && !datos.nombre.trim()) {
    throw new ErrorVendedor("El vendedor necesita un nombre.");
  }
  validar(datos);
  await db.update(vendedores).set(datos).where(eq(vendedores.id, id)).run();
}

function validar(datos: Partial<DatosVendedor>): void {
  if (datos.modalidad !== undefined && !MODALIDADES_VENDEDOR.includes(datos.modalidad)) {
    throw new ErrorVendedor("Esa modalidad no existe.");
  }
  if (datos.comisionPorBultoCentavos !== undefined && datos.comisionPorBultoCentavos < 0) {
    throw new ErrorVendedor("La comisión por bulto no puede ser negativa.");
  }
}

/**
 * La comisión de un renglón: tanto por bulto, proporcional a lo que se vendió.
 * Media docena de un bulto de doce paga media comisión —cobrar el bulto entero
 * por seis envases sería regalar plata, y no cobrar nada sería robársela al
 * vendedor—. Se redondea al centavo, que es la unidad en la que se paga.
 */
export function comisionDeRenglon(cantidad: number, unidadesPorBulto: number, porBultoCentavos: number): number {
  if (porBultoCentavos <= 0 || cantidad <= 0) return 0;
  return Math.round((cantidad * porBultoCentavos) / Math.max(1, unidadesPorBulto));
}

export type LineaLiquidacion = {
  vendedor: Vendedor;
  /** Pedidos entregados en el período: son los que devengan comisión. */
  pedidos: number;
  unidades: number;
  ventasCentavos: number;
  comisionCentavos: number;
  /** Comercios de ese vendedor, aunque en el período no hayan comprado. */
  comercios: number;
};

/**
 * Qué se le debe a cada vendedor en el período.
 *
 * Cuenta solo los pedidos entregados: la comisión se gana cuando la mercadería
 * llegó, no cuando se cargó el pedido. Un pedido pendiente o cancelado no se
 * liquida, y uno borrado desaparece con su comisión.
 */
export async function liquidacion(rango: { desde: string; hasta: string }): Promise<LineaLiquidacion[]> {
  const lista = await listarVendedores();
  if (lista.length === 0) return [];

  const ids = lista.map((v) => v.id);

  const porVendedor = await db
    .select({
      vendedorId: pedidos.vendedorId,
      pedidos: sql<number>`count(distinct ${pedidos.id})`,
      comisionCentavos: sql<number>`coalesce(sum(${pedidos.comisionCentavos}), 0)`,
    })
    .from(pedidos)
    .where(
      and(
        inArray(pedidos.vendedorId, ids),
        eq(pedidos.estado, "entregado"),
        gte(pedidos.fecha, rango.desde),
        lte(pedidos.fecha, rango.hasta),
      ),
    )
    .groupBy(pedidos.vendedorId)
    .all();

  // Las unidades y la venta salen de los renglones, que es donde está el detalle.
  const totales = await db.all<{ vendedor_id: string; unidades: number; venta: number }>(sql`
    select p.vendedor_id as vendedor_id,
           coalesce(sum(i.cantidad), 0) as unidades,
           coalesce(sum(i.cantidad * i.precio_unit_centavos), 0) as venta
      from pedidos p
      join pedido_items i on i.pedido_id = p.id
     where p.estado = 'entregado'
       and p.fecha >= ${rango.desde}
       and p.fecha <= ${rango.hasta}
       and p.vendedor_id is not null
     group by p.vendedor_id
  `);

  const comercios = await db
    .select({ vendedorId: clientes.vendedorId, cuantos: sql<number>`count(*)` })
    .from(clientes)
    .where(and(inArray(clientes.vendedorId, ids), eq(clientes.activo, true)))
    .groupBy(clientes.vendedorId)
    .all();

  const porId = new Map(porVendedor.map((f) => [f.vendedorId ?? "", f]));
  const detalle = new Map(totales.map((f) => [f.vendedor_id, f]));
  const cartera = new Map(comercios.map((f) => [f.vendedorId ?? "", f.cuantos]));

  return lista
    .map((vendedor) => ({
      vendedor,
      pedidos: porId.get(vendedor.id)?.pedidos ?? 0,
      unidades: detalle.get(vendedor.id)?.unidades ?? 0,
      ventasCentavos: detalle.get(vendedor.id)?.venta ?? 0,
      comisionCentavos: porId.get(vendedor.id)?.comisionCentavos ?? 0,
      comercios: cartera.get(vendedor.id) ?? 0,
    }))
    .sort((a, b) => b.comisionCentavos - a.comisionCentavos || a.vendedor.nombre.localeCompare(b.vendedor.nombre));
}
