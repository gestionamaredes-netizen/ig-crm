import "server-only";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { pedidoItems, pedidos, productos } from "../db/schema";
import { hoy } from "../formato";
import { leerNumero } from "./config";
import { comprometidoPorProducto } from "./stock";

export type LineaRotacion = {
  id: string;
  nombre: string;
  presentacion: string;
  stock: number;
  comprometido: number;
  libre: number;
  stockMinimo: number;
  costoCentavos: number;
  /** Unidades entregadas en la ventana mirada. */
  vendidoEnVentana: number;
  ventaDiaria: number;
  ventaSemanal: number;
  /** Días que aguanta lo libre al ritmo actual. Null si no se vendió nada. */
  diasDeStock: number | null;
  /** Cuánto convendría comprar para cubrir los días objetivo. */
  sugerenciaCompra: number;
  bajoMinimo: boolean;
  sinMovimiento: boolean;
};

function restarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

/**
 * Ritmo de venta y cuánto aguanta el depósito.
 *
 * Mira solo lo entregado: un pedido pendiente todavía no salió. La ventana por
 * defecto es de 60 días porque con menos, una semana floja o un pedido grande
 * mueven el promedio demasiado como para decidir una compra con eso.
 */
export async function rotacion(opciones: { ventanaDias?: number; hasta?: string } = {}): Promise<LineaRotacion[]> {
  const ventanaDias = opciones.ventanaDias ?? 60;
  const hasta = opciones.hasta ?? hoy();
  const desde = restarDias(hasta, ventanaDias);
  const diasObjetivo = await leerNumero("diasDeCobertura");

  const ventas = await db
    .select({
      productoId: pedidoItems.productoId,
      unidades: sql<number>`coalesce(sum(${pedidoItems.cantidad}), 0)`,
    })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidos.id, pedidoItems.pedidoId))
    .where(and(eq(pedidos.estado, "entregado"), gte(pedidos.fecha, desde), lte(pedidos.fecha, hasta)))
    .groupBy(pedidoItems.productoId)
    .all();
  const vendidoPor = new Map(ventas.map((v) => [v.productoId, v.unidades]));

  const comprometido = await comprometidoPorProducto();
  const catalogo = await db.select().from(productos).where(eq(productos.activo, true)).all();

  return catalogo
    .map((p) => {
      const vendido = vendidoPor.get(p.id) ?? 0;
      const ventaDiaria = vendido / ventanaDias;
      const reservado = comprometido.get(p.id) ?? 0;
      const libre = p.stock - reservado;

      return {
        id: p.id,
        nombre: p.nombre,
        presentacion: p.presentacion,
        stock: p.stock,
        comprometido: reservado,
        libre,
        stockMinimo: p.stockMinimo,
        costoCentavos: p.costoCentavos,
        vendidoEnVentana: vendido,
        ventaDiaria,
        ventaSemanal: ventaDiaria * 7,
        // Sin ventas no hay ritmo: decir "infinitos días" sería inventar.
        diasDeStock: ventaDiaria > 0 ? Math.floor(libre / ventaDiaria) : null,
        sugerenciaCompra: Math.max(0, Math.ceil(ventaDiaria * diasObjetivo - libre)),
        bajoMinimo: p.stockMinimo > 0 && libre <= p.stockMinimo,
        sinMovimiento: vendido === 0,
      };
    })
    .sort((a, b) => {
      // Primero lo que se está por acabar; lo que no se mueve, al final.
      if (a.diasDeStock === null && b.diasDeStock === null) return a.nombre.localeCompare(b.nombre);
      if (a.diasDeStock === null) return 1;
      if (b.diasDeStock === null) return -1;
      return a.diasDeStock - b.diasDeStock;
    });
}

/** Lo que hay que ir a comprar: se está acabando o ya cayó bajo el mínimo. */
export async function aReponer(
  opciones: { ventanaDias?: number; hasta?: string } = {},
): Promise<LineaRotacion[]> {
  const lineas = await rotacion(opciones);
  const diasObjetivo = await leerNumero("diasDeCobertura");
  return lineas.filter((l) => l.bajoMinimo || (l.diasDeStock !== null && l.diasDeStock < diasObjetivo));
}
