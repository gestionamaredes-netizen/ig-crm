import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Recorre el circuito real contra una base SQLite descartable: pedido, entrega,
 * movimiento de stock, venta del comercio y rentabilidad del período.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-test-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  productos: typeof import("./productos");
  clientes: typeof import("./clientes");
  pedidos: typeof import("./pedidos");
  gastos: typeof import("./gastos");
  panel: typeof import("./panel");
  reportes: typeof import("./reportes");
};

let m: Modulos;
let productoId: string;
let clienteId: string;
const HOY = "2026-09-01";
const RANGO = { desde: "2026-09-01", hasta: "2026-09-30" };

beforeAll(async () => {
  m = {
    productos: await import("./productos"),
    clientes: await import("./clientes"),
    pedidos: await import("./pedidos"),
    gastos: await import("./gastos"),
    panel: await import("./panel"),
    reportes: await import("./reportes"),
  };

  productoId = m.productos.crearProducto({
    nombre: "Powerfull 3 en 1",
    stock: 100,
    costoCentavos: 450000,
    precioCentavos: 750000,
  });
  clienteId = m.clientes.crearCliente({ comercio: "Kiosco de prueba", persona: "Ana" });
});

describe("alta de cliente", () => {
  it("le deja un link de acceso listo para compartir", () => {
    const accesos = m.clientes.listarAccesos(clienteId);
    expect(accesos).toHaveLength(1);
    expect(accesos[0].token).toHaveLength(32);
  });

  it("suma un representante sin tocar el acceso del dueño", () => {
    m.clientes.crearAcceso(clienteId, "Repositor");
    const accesos = m.clientes.listarAccesos(clienteId);
    expect(accesos).toHaveLength(2);
    expect(new Set(accesos.map((a) => a.token)).size).toBe(2);
    expect(accesos[1].rol).toBe("representante");
  });
});

describe("pedido", () => {
  it("rechaza un pedido sin productos", () => {
    expect(() => m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [] })).toThrow(m.pedidos.ErrorPedido);
  });

  it("congela precio y costo aunque después cambie la lista", () => {
    const id = m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 10 }] });

    m.productos.actualizarProducto(productoId, { precioCentavos: 900000, costoCentavos: 500000 });

    const pedido = m.pedidos.obtenerPedido(id)!;
    expect(pedido.items[0].precioUnitCentavos).toBe(750000);
    expect(pedido.items[0].costoUnitCentavos).toBe(450000);
  });
});

describe("entrega y stock", () => {
  let pedidoId: string;

  beforeAll(() => {
    m.productos.actualizarProducto(productoId, { stock: 100, precioCentavos: 750000, costoCentavos: 450000 });
    pedidoId = m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 20 }] });
  });

  it("no toca el stock mientras el pedido está pendiente", () => {
    expect(m.productos.obtenerProducto(productoId)!.stock).toBe(100);
  });

  it("descuenta el stock al entregar", () => {
    m.pedidos.cambiarEstado(pedidoId, "entregado");
    expect(m.productos.obtenerProducto(productoId)!.stock).toBe(80);
  });

  it("no vuelve a descontar si se marca entregado dos veces", () => {
    m.pedidos.cambiarEstado(pedidoId, "entregado");
    expect(m.productos.obtenerProducto(productoId)!.stock).toBe(80);
  });

  it("reintegra el stock si el pedido vuelve atrás", () => {
    m.pedidos.cambiarEstado(pedidoId, "pendiente");
    expect(m.productos.obtenerProducto(productoId)!.stock).toBe(100);
    m.pedidos.cambiarEstado(pedidoId, "entregado");
  });
});

describe("panel del comercio", () => {
  it("cuenta como stock del comercio lo entregado", () => {
    const linea = m.panel.stockDelCliente(clienteId).find((l) => l.productoId === productoId)!;
    expect(linea.recibido).toBe(20);
    expect(linea.disponible).toBe(20);
  });

  it("descuenta las ventas que declara el comercio", () => {
    m.panel.registrarVenta({ clienteId, productoId, cantidad: 5, fecha: HOY, registradoPor: "Ana" });
    const linea = m.panel.stockDelCliente(clienteId).find((l) => l.productoId === productoId)!;
    expect(linea.vendido).toBe(5);
    expect(linea.disponible).toBe(15);
  });

  it("no deja vender más de lo que tiene", () => {
    expect(() =>
      m.panel.registrarVenta({ clienteId, productoId, cantidad: 999, fecha: HOY, registradoPor: "Ana" }),
    ).toThrow(m.panel.ErrorPanel);
  });
});

describe("rentabilidad", () => {
  beforeAll(() => {
    const transporte = m.gastos.crearCategoria("Transporte", "logistico");
    const sueldos = m.gastos.crearCategoria("Empleados", "operativo");
    const entregado = m.pedidos.listarPedidos({ clienteId }).find((p) => p.estado === "entregado")!;

    m.gastos.crearGasto({ categoriaId: transporte, fecha: HOY, montoCentavos: 1500000, pedidoId: entregado.id });
    m.gastos.crearGasto({ categoriaId: sueldos, fecha: HOY, montoCentavos: 20000000 });
  });

  it("calcula el margen bruto sobre lo entregado", () => {
    const r = m.reportes.resumen(RANGO);
    // 20 unidades a 7.500 de venta y 4.500 de costo.
    expect(r.ingresosCentavos).toBe(15000000);
    expect(r.costoCentavos).toBe(9000000);
    expect(r.margenBruto).toBe(6000000);
  });

  it("resta todos los gastos del período para el neto", () => {
    const r = m.reportes.resumen(RANGO);
    expect(r.gastosCentavos).toBe(21500000);
    expect(r.neto).toBe(6000000 - 21500000);
  });

  it("imputa el gasto logístico al margen del pedido que lo generó", () => {
    const [pedido] = m.reportes.rentabilidadPorPedido(RANGO);
    expect(pedido.gastosCentavos).toBe(1500000);
    expect(pedido.margenCentavos).toBe(15000000 - 9000000 - 1500000);
  });

  it("deja fuera del período lo que cae afuera del rango", () => {
    const vacio = m.reportes.resumen({ desde: "2026-10-01", hasta: "2026-10-31" });
    expect(vacio.ingresosCentavos).toBe(0);
    expect(vacio.neto).toBe(0);
  });
});

describe("calcularResultado", () => {
  it("no divide por cero cuando no hubo ventas", () => {
    const r = m.reportes.calcularResultado({ ingresosCentavos: 0, costoCentavos: 0, gastosCentavos: 5000 });
    expect(r.neto).toBe(-5000);
    expect(r.margenPorcentual).toBeNull();
  });
});
