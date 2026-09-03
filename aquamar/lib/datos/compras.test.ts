import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { hoy } from "../formato";

/**
 * Compras, costos y escalas de precio contra una base descartable. La
 * aritmética de la factura se prueba aparte, sin base, porque es pura.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-compras-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  compras: typeof import("./compras");
  config: typeof import("./config");
  pedidos: typeof import("./pedidos");
  precios: typeof import("./precios");
  productos: typeof import("./productos");
  proveedores: typeof import("./proveedores");
  clientes: typeof import("./clientes");
  stock: typeof import("./stock");
};

let m: Modulos;
let productoId: string;
let proveedorId: string;

const HOY = hoy();

beforeAll(async () => {
  m = {
    compras: await import("./compras"),
    config: await import("./config"),
    pedidos: await import("./pedidos"),
    precios: await import("./precios"),
    productos: await import("./productos"),
    proveedores: await import("./proveedores"),
    clientes: await import("./clientes"),
    stock: await import("./stock"),
  };

  productoId = await m.productos.crearProducto({
    nombre: "Powerful 3 en 1",
    presentacion: "Caja x 30",
    stock: 0,
    costoCentavos: 0,
    precioCentavos: 750000,
  });
  proveedorId = await m.proveedores.crearProveedor({ nombre: "Powerful SA", cuit: "30-11111111-9" });
});

describe("aritmética de la factura", () => {
  const renglones = [
    { productoId: "a", cantidad: 10, costoUnitNetoCentavos: 100000, ivaAlicuota: 2100 },
    { productoId: "b", cantidad: 5, costoUnitNetoCentavos: 200000, ivaAlicuota: 2100 },
  ];

  it("suma neto, IVA y total como la factura", () => {
    const r = m.compras.calcularCompra(renglones, { percepcionesCentavos: 0, otrosCentavos: 0 }, "responsable_inscripto");
    expect(r.netoCentavos).toBe(2000000); // 10×1.000 + 5×2.000
    expect(r.ivaCentavos).toBe(420000); // 21%
    expect(r.totalCentavos).toBe(2420000);
  });

  it("deja el IVA afuera del costo si es Responsable Inscripto", () => {
    const r = m.compras.calcularCompra(renglones, {}, "responsable_inscripto");
    expect(r.renglones[0].costoRealUnitCentavos).toBe(100000);
  });

  it("mete el IVA adentro del costo si es Monotributo", () => {
    const r = m.compras.calcularCompra(renglones, {}, "monotributo");
    expect(r.renglones[0].costoRealUnitCentavos).toBe(121000); // 1.000 + 21%
  });

  it("reparte percepciones y flete a prorrata de lo que pesa cada renglón", () => {
    const r = m.compras.calcularCompra(
      renglones,
      { percepcionesCentavos: 60000, otrosCentavos: 40000 },
      "responsable_inscripto",
    );
    // 100.000 a repartir: el renglón A es la mitad del neto, el B la otra mitad.
    expect(r.renglones[0].prorrateoCentavos).toBe(50000);
    expect(r.renglones[1].prorrateoCentavos).toBe(50000);
    expect(r.renglones[0].costoRealUnitCentavos).toBe(105000);
    expect(r.renglones[1].costoRealUnitCentavos).toBe(210000);
  });

  it("no pierde centavos al repartir: el resto va al último renglón", () => {
    const r = m.compras.calcularCompra(
      [
        { productoId: "a", cantidad: 1, costoUnitNetoCentavos: 100, ivaAlicuota: 0 },
        { productoId: "b", cantidad: 1, costoUnitNetoCentavos: 100, ivaAlicuota: 0 },
        { productoId: "c", cantidad: 1, costoUnitNetoCentavos: 100, ivaAlicuota: 0 },
      ],
      { otrosCentavos: 100 },
      "responsable_inscripto",
    );
    const sumado = r.renglones.reduce((a, x) => a + x.prorrateoCentavos, 0);
    expect(sumado).toBe(100);
  });

  it("reparte por unidades si la mercadería vino sin cargo", () => {
    const r = m.compras.calcularCompra(
      [
        { productoId: "a", cantidad: 3, costoUnitNetoCentavos: 0, ivaAlicuota: 0 },
        { productoId: "b", cantidad: 1, costoUnitNetoCentavos: 0, ivaAlicuota: 0 },
      ],
      { otrosCentavos: 4000 },
      "responsable_inscripto",
    );
    expect(r.renglones[0].prorrateoCentavos).toBe(3000);
    expect(r.renglones[1].prorrateoCentavos).toBe(1000);
  });
});

describe("promedio ponderado", () => {
  it("toma el costo nuevo cuando el depósito estaba vacío", () => {
    expect(m.compras.promedioPonderado(0, 0, 10, 50000)).toBe(50000);
  });

  it("promedia contra lo que ya había", () => {
    // 10 a 100 + 10 a 200 = 20 a 150
    expect(m.compras.promedioPonderado(10, 10000, 10, 20000)).toBe(15000);
  });
});

describe("circuito de compra", () => {
  let compraId: string;

  beforeAll(async () => {
    compraId = await m.compras.crearCompra({
      proveedorId,
      fecha: HOY,
      comprobante: "A 0001-00012345",
      formaPago: "transferencia",
      percepcionesCentavos: 0,
      otrosCentavos: 0,
      items: [{ productoId, cantidad: 100, costoUnitNetoCentavos: 400000, ivaAlicuota: 2100 }],
    });
  });

  it("nace en borrador y no toca el depósito", async () => {
    const compra = (await m.compras.obtenerCompra(compraId))!;
    expect(compra.estado).toBe("borrador");
    expect((await m.productos.obtenerProducto(productoId))!.stock).toBe(0);
  });

  it("al confirmar entra la mercadería y fija el costo", async () => {
    await m.compras.confirmarCompra(compraId);
    const p = (await m.productos.obtenerProducto(productoId))!;
    expect(p.stock).toBe(100);
    expect(p.costoCentavos).toBe(400000); // RI: el IVA no es costo
    expect(p.ultimoCostoCentavos).toBe(400000);
  });

  it("deja el movimiento en el libro del depósito, atado a la compra", async () => {
    const mov = (await m.stock.listarMovimientos({ productoId })).find((x) => x.compraId === compraId)!;
    expect(mov.tipo).toBe("entrada");
    expect(mov.cantidad).toBe(100);
    expect(mov.motivo).toContain("A 0001-00012345");
  });

  it("no vuelve a entrar mercadería si se confirma dos veces", async () => {
    await m.compras.confirmarCompra(compraId);
    expect((await m.productos.obtenerProducto(productoId))!.stock).toBe(100);
  });

  it("promedia el costo cuando el proveedor aumenta", async () => {
    const segunda = await m.compras.crearCompra({
      proveedorId,
      fecha: HOY,
      comprobante: "A 0001-00012346",
      items: [{ productoId, cantidad: 100, costoUnitNetoCentavos: 600000, ivaAlicuota: 2100 }],
    });
    await m.compras.confirmarCompra(segunda);

    const p = (await m.productos.obtenerProducto(productoId))!;
    expect(p.stock).toBe(200);
    expect(p.costoCentavos).toBe(500000); // 100 a 4.000 + 100 a 6.000
    expect(p.ultimoCostoCentavos).toBe(600000); // el último sí es el nuevo
  });

  it("lleva el saldo de pagos y no deja pagar de más", async () => {
    const compra = (await m.compras.obtenerCompra(compraId))!;
    expect(m.compras.estadoPago(compra)).toBe("pendiente");

    await m.compras.registrarPago(compraId, 1000000);
    const parcial = (await m.compras.obtenerCompra(compraId))!;
    expect(m.compras.estadoPago(parcial)).toBe("parcial");

    await expect(m.compras.registrarPago(compraId, 99999999)).rejects.toThrow(m.compras.ErrorCompra);

    await m.compras.registrarPago(compraId, m.compras.saldoCompra(parcial));
    expect(m.compras.estadoPago((await m.compras.obtenerCompra(compraId))!)).toBe("pagado");
  });

  it("muestra el historial de precios pagados por el producto", async () => {
    const historial = await m.compras.historialDeProducto(productoId);
    expect(historial).toHaveLength(2);
    expect(historial.map((h) => h.costoRealUnitCentavos).sort()).toEqual([400000, 600000]);
  });

  it("informa lo que se le debe al proveedor", async () => {
    const deuda = (await m.compras.cuentasPorPagar()).find((d) => d.proveedorId === proveedorId)!;
    // La primera quedó paga; la segunda entera a deber.
    expect(deuda.saldoCentavos).toBe(600000 * 100 * 1.21);
  });
});

describe("anulación", () => {
  it("devuelve la mercadería y deshace el promedio", async () => {
    const antes = (await m.productos.obtenerProducto(productoId))!;
    const compraId = await m.compras.crearCompra({
      proveedorId,
      fecha: HOY,
      items: [{ productoId, cantidad: 50, costoUnitNetoCentavos: 900000, ivaAlicuota: 2100 }],
    });
    await m.compras.confirmarCompra(compraId);
    expect((await m.productos.obtenerProducto(productoId))!.costoCentavos).not.toBe(antes.costoCentavos);

    await m.compras.anularCompra(compraId, "Cargada dos veces");

    const despues = (await m.productos.obtenerProducto(productoId))!;
    expect(despues.stock).toBe(antes.stock);
    expect(despues.costoCentavos).toBe(antes.costoCentavos);
    expect((await m.compras.obtenerCompra(compraId))!.estado).toBe("anulada");
  });

  it("pide un motivo", async () => {
    const compraId = await m.compras.crearCompra({
      proveedorId,
      fecha: HOY,
      items: [{ productoId, cantidad: 1, costoUnitNetoCentavos: 1000, ivaAlicuota: 0 }],
    });
    await expect(m.compras.anularCompra(compraId, "   ")).rejects.toThrow(m.compras.ErrorCompra);
  });

  it("no deja borrar una compra confirmada, solo anularla", async () => {
    const compraId = await m.compras.crearCompra({
      proveedorId,
      fecha: HOY,
      items: [{ productoId, cantidad: 1, costoUnitNetoCentavos: 1000, ivaAlicuota: 0 }],
    });
    await m.compras.confirmarCompra(compraId);
    await expect(m.compras.eliminarBorrador(compraId)).rejects.toThrow(/borradores/);
  });
});

describe("escalas de precio", () => {
  beforeAll(async () => {
    await m.precios.crearEscala({ productoId, nombre: "+3 bultos", desdeCantidad: 3, precioCentavos: 700000 });
    await m.precios.crearEscala({ productoId, nombre: "+10 bultos", desdeCantidad: 10, precioCentavos: 650000 });
    await m.precios.crearEscala({ productoId, nombre: "+25 bultos", desdeCantidad: 25, precioCentavos: 600000 });
  });

  it("elige la escala que corresponde a la cantidad", () => {
    const escalas = [
      { desdeCantidad: 3, precioCentavos: 700000, activo: true },
      { desdeCantidad: 10, precioCentavos: 650000, activo: true },
      { desdeCantidad: 25, precioCentavos: 600000, activo: true },
    ];
    expect(m.precios.precioParaCantidad(1, 750000, escalas)).toBe(750000);
    expect(m.precios.precioParaCantidad(3, 750000, escalas)).toBe(700000);
    expect(m.precios.precioParaCantidad(9, 750000, escalas)).toBe(700000);
    expect(m.precios.precioParaCantidad(30, 750000, escalas)).toBe(600000);
  });

  it("ignora las escalas desactivadas", () => {
    expect(
      m.precios.precioParaCantidad(30, 750000, [{ desdeCantidad: 25, precioCentavos: 600000, activo: false }]),
    ).toBe(750000);
  });

  it("no acepta dos escalas con el mismo corte", async () => {
    await expect(
      m.precios.crearEscala({ productoId, nombre: "otra", desdeCantidad: 10, precioCentavos: 1 }),
    ).rejects.toThrow(m.precios.ErrorPrecio);
  });

  it("aplica la escala al crear un pedido", async () => {
    const clienteId = await m.clientes.crearCliente({ comercio: "Kiosco Escala", persona: "Ana" });
    const pedidoId = await m.pedidos.crearPedido({
      clienteId,
      fecha: HOY,
      items: [{ productoId, cantidad: 12 }],
    });
    const pedido = (await m.pedidos.obtenerPedido(pedidoId))!;
    expect(pedido.items[0].precioUnitCentavos).toBe(650000);
  });

  it("respeta el precio que Comercial escribe a mano", async () => {
    const clienteId = await m.clientes.crearCliente({ comercio: "Kiosco Especial", persona: "Beto" });
    const pedidoId = await m.pedidos.crearPedido({
      clienteId,
      fecha: HOY,
      items: [{ productoId, cantidad: 12, precioUnitCentavos: 500000 }],
    });
    const pedido = (await m.pedidos.obtenerPedido(pedidoId))!;
    expect(pedido.items[0].precioUnitCentavos).toBe(500000);
  });
});

describe("régimen fiscal", () => {
  it("arranca en Responsable Inscripto y se puede cambiar", async () => {
    expect(await m.config.regimenActual()).toBe("responsable_inscripto");
    await m.config.guardarRegimen("monotributo");
    expect(await m.config.regimenActual()).toBe("monotributo");
    expect(m.config.ivaEsRecuperable("monotributo")).toBe(false);
    await m.config.guardarRegimen("responsable_inscripto");
  });
});
