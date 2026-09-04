import "server-only";
import { db } from "../db";
import { compraItems, compras, movimientosCaja, movimientosStock, productos, proveedores } from "../db/schema";
import { eq } from "drizzle-orm";
import { listarClientes, clientesConMetricas } from "./clientes";
import { listarGastos } from "./gastos";
import { listarPedidos } from "./pedidos";
import { hoy } from "../formato";

/**
 * Escapa un valor para CSV. Excel argentino abre con punto y coma, así que ese
 * es el separador; los importes van con coma decimal para que no los lea como
 * texto.
 */
function celda(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  const texto = String(valor);
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

const pesos = (centavos: number) => (centavos / 100).toFixed(2).replace(".", ",");

export function aCsv(filas: Record<string, unknown>[]): string {
  if (filas.length === 0) return "";
  const columnas = Object.keys(filas[0]);
  const lineas = [columnas.join(";")];
  for (const fila of filas) lineas.push(columnas.map((c) => celda(fila[c])).join(";"));
  // BOM: sin esto Excel abre los acentos rotos.
  return `﻿${lineas.join("\n")}\n`;
}

export const EXPORTABLES = {
  productos: "Productos",
  clientes: "Clientes",
  pedidos: "Pedidos",
  compras: "Compras",
  gastos: "Gastos",
  caja: "Movimientos de caja",
  stock: "Movimientos de stock",
} as const;

export type Exportable = keyof typeof EXPORTABLES;

export async function exportar(que: Exportable): Promise<string> {
  switch (que) {
    case "productos": {
      const filas = await db.select().from(productos).all();
      return aCsv(
        filas.map((p) => ({
          Nombre: p.nombre,
          Presentación: p.presentacion,
          "En depósito": p.stock,
          "Stock mínimo": p.stockMinimo,
          "Costo promedio": pesos(p.costoCentavos),
          "Último costo": pesos(p.ultimoCostoCentavos),
          "Precio de venta": pesos(p.precioCentavos),
          Activo: p.activo ? "sí" : "no",
        })),
      );
    }
    case "clientes": {
      const filas = await clientesConMetricas(hoy());
      return aCsv(
        filas.map((c) => ({
          Comercio: c.comercio,
          Persona: c.persona,
          Teléfono: c.telefono,
          Email: c.email,
          Dirección: c.direccion,
          "Razón social": c.razonSocial,
          CUIT: c.cuit,
          "Condición fiscal": c.condicionFiscal,
          Tipo: c.tipo,
          Pedidos: c.pedidos,
          "Total comprado": pesos(c.totalCompradoCentavos),
          "Saldo pendiente": pesos(c.saldoCentavos),
          "Ticket promedio": pesos(c.ticketPromedioCentavos),
          "Última compra": c.ultimaCompra ?? "",
          "Días sin comprar": c.diasSinComprar ?? "",
          Activo: c.activo ? "sí" : "no",
        })),
      );
    }
    case "pedidos": {
      const filas = await listarPedidos();
      return aCsv(
        filas.map((p) => ({
          Número: p.numero,
          Fecha: p.fecha,
          Comercio: p.comercio,
          Estado: p.estado,
          Unidades: p.unidades,
          Total: pesos(p.totalCentavos),
          Costo: pesos(p.costoCentavos),
          Margen: pesos(p.totalCentavos - p.costoCentavos),
          Cobrado: pesos(p.cobradoCentavos),
          Saldo: pesos(Math.max(0, p.totalCentavos - p.cobradoCentavos)),
          "Forma de pago": p.formaPago,
          "Entrega estimada": p.fechaEntrega ?? "",
          "Tipo de entrega": p.tipoEntrega,
        })),
      );
    }
    case "compras": {
      const filas = await db
        .select({
          numero: compras.numero,
          fecha: compras.fecha,
          proveedor: proveedores.nombre,
          comprobante: compras.comprobante,
          neto: compras.netoCentavos,
          iva: compras.ivaCentavos,
          percepciones: compras.percepcionesCentavos,
          otros: compras.otrosCentavos,
          total: compras.totalCentavos,
          pagado: compras.pagadoCentavos,
          estado: compras.estado,
          formaPago: compras.formaPago,
        })
        .from(compras)
        .innerJoin(proveedores, eq(proveedores.id, compras.proveedorId))
        .all();
      return aCsv(
        filas.map((c) => ({
          Número: c.numero,
          Fecha: c.fecha,
          Proveedor: c.proveedor,
          Comprobante: c.comprobante,
          Neto: pesos(c.neto),
          IVA: pesos(c.iva),
          Percepciones: pesos(c.percepciones),
          Otros: pesos(c.otros),
          Total: pesos(c.total),
          Pagado: pesos(c.pagado),
          Saldo: pesos(Math.max(0, c.total - c.pagado)),
          Estado: c.estado,
          "Forma de pago": c.formaPago,
        })),
      );
    }
    case "gastos": {
      const filas = await listarGastos();
      return aCsv(
        filas.map((g) => ({
          Fecha: g.fecha,
          Categoría: g.categoria,
          Tipo: g.tipo,
          Monto: pesos(g.montoCentavos),
          Detalle: g.descripcion,
          Pedido: g.numeroPedido ?? "",
          "Se pagó con": g.medioPago,
        })),
      );
    }
    case "caja": {
      const filas = await db.select().from(movimientosCaja).all();
      return aCsv(
        filas.map((m) => ({
          Fecha: m.fecha,
          Concepto: m.concepto,
          Medio: m.medio,
          Importe: pesos(m.montoCentavos),
        })),
      );
    }
    case "stock": {
      const filas = await db
        .select({
          fecha: movimientosStock.fecha,
          producto: productos.nombre,
          tipo: movimientosStock.tipo,
          cantidad: movimientosStock.cantidad,
          resultante: movimientosStock.stockResultante,
          motivo: movimientosStock.motivo,
          registradoPor: movimientosStock.registradoPor,
        })
        .from(movimientosStock)
        .innerJoin(productos, eq(productos.id, movimientosStock.productoId))
        .all();
      return aCsv(
        filas.map((m) => ({
          Fecha: m.fecha,
          Producto: m.producto,
          Tipo: m.tipo,
          Cantidad: m.cantidad,
          "Stock resultante": m.resultante,
          Motivo: m.motivo,
          "Registrado por": m.registradoPor,
        })),
      );
    }
  }
}

/** Todo junto, para guardarse una copia completa. */
export async function respaldoCompleto(): Promise<Record<Exportable, string>> {
  const salida = {} as Record<Exportable, string>;
  for (const clave of Object.keys(EXPORTABLES) as Exportable[]) salida[clave] = await exportar(clave);
  return salida;
}

/** Cuenta cuántas filas tiene cada tabla, para saber qué se está respaldando. */
export async function inventarioDeDatos() {
  const contar = async (filas: Promise<unknown[]>) => (await filas).length;
  return {
    productos: await contar(db.select().from(productos).all()),
    clientes: (await listarClientes()).length,
    pedidos: (await listarPedidos()).length,
    compras: await contar(db.select().from(compras).all()),
    renglonesDeCompra: await contar(db.select().from(compraItems).all()),
    gastos: (await listarGastos()).length,
    movimientosDeCaja: await contar(db.select().from(movimientosCaja).all()),
    movimientosDeStock: await contar(db.select().from(movimientosStock).all()),
  };
}
