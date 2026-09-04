import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { hoy } from "../formato";

/**
 * Caja, cobranzas y cartera de clientes. La caja tiene que cuadrar con lo que
 * dicen los pedidos, las compras y los gastos: si no, no sirve de nada.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-caja-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  caja: typeof import("./caja");
  clientes: typeof import("./clientes");
  compras: typeof import("./compras");
  gastos: typeof import("./gastos");
  pedidos: typeof import("./pedidos");
  precios: typeof import("./precios");
  productos: typeof import("./productos");
  proveedores: typeof import("./proveedores");
};

let m: Modulos;
let productoId: string;
let clienteId: string;
let proveedorId: string;

const HOY = hoy();

beforeAll(async () => {
  m = {
    caja: await import("./caja"),
    clientes: await import("./clientes"),
    compras: await import("./compras"),
    gastos: await import("./gastos"),
    pedidos: await import("./pedidos"),
    precios: await import("./precios"),
    productos: await import("./productos"),
    proveedores: await import("./proveedores"),
  };

  productoId = await m.productos.crearProducto({
    nombre: "Powerful 3 en 1", stock: 500, costoCentavos: 400000, precioCentavos: 750000,
  });
  clienteId = await m.clientes.crearCliente({
    comercio: "Almacén La Esquina", persona: "Marta",
    cuit: "27-33444555-2", condicionFiscal: "Monotributo", tipo: "comercio",
  });
  proveedorId = await m.proveedores.crearProveedor({ nombre: "Powerful SA" });
});

describe("libro de caja", () => {
  it("arranca en cero", async () => {
    expect((await m.caja.saldos()).total).toBe(0);
  });

  it("toma un saldo inicial cargado a mano", async () => {
    await m.caja.registrarManual({ montoCentavos: 10000000, medio: "efectivo", concepto: "Saldo inicial", fecha: HOY });
    await m.caja.registrarManual({ montoCentavos: 50000000, medio: "banco", concepto: "Saldo inicial", fecha: HOY });
    const s = await m.caja.saldos();
    expect(s.efectivo).toBe(10000000);
    expect(s.banco).toBe(50000000);
    expect(s.total).toBe(60000000);
  });

  it("pide un concepto para un movimiento a mano", async () => {
    await expect(
      m.caja.registrarManual({ montoCentavos: 100, medio: "efectivo", concepto: "  " }),
    ).rejects.toThrow(m.caja.ErrorCaja);
  });

  it("un pase entre efectivo y banco no cambia el total", async () => {
    const antes = await m.caja.saldos();
    await m.caja.transferir({ desde: "efectivo", hacia: "banco", montoCentavos: 3000000, fecha: HOY });
    const despues = await m.caja.saldos();
    expect(despues.total).toBe(antes.total);
    expect(despues.efectivo).toBe(antes.efectivo - 3000000);
    expect(despues.banco).toBe(antes.banco + 3000000);
  });

  it("no deja transferir al mismo lugar", async () => {
    await expect(
      m.caja.transferir({ desde: "banco", hacia: "banco", montoCentavos: 100 }),
    ).rejects.toThrow(m.caja.ErrorCaja);
  });
});

describe("cobranza de pedidos", () => {
  let pedidoId: string;

  beforeAll(async () => {
    pedidoId = await m.pedidos.crearPedido({
      clienteId, fecha: HOY, formaPago: "transferencia", items: [{ productoId, cantidad: 10 }],
    });
    await m.pedidos.cambiarEstado(pedidoId, "entregado");
  });

  it("nace pendiente de cobro", async () => {
    const p = (await m.pedidos.listarPedidos({ clienteId })).find((x) => x.id === pedidoId)!;
    expect(m.pedidos.estadoCobro(p)).toBe("pendiente");
    expect(m.pedidos.saldoPedido(p)).toBe(7500000);
  });

  it("un cobro entra a la caja en el mismo movimiento", async () => {
    const antes = await m.caja.saldos();
    await m.pedidos.registrarCobro({ pedidoId, montoCentavos: 3000000, medio: "efectivo", fecha: HOY });

    const despues = await m.caja.saldos();
    expect(despues.efectivo).toBe(antes.efectivo + 3000000);

    const p = (await m.pedidos.listarPedidos({ clienteId })).find((x) => x.id === pedidoId)!;
    expect(m.pedidos.estadoCobro(p)).toBe("parcial");
  });

  it("no deja cobrar más que el total", async () => {
    await expect(
      m.pedidos.registrarCobro({ pedidoId, montoCentavos: 99999999, medio: "efectivo" }),
    ).rejects.toThrow(m.pedidos.ErrorPedido);
  });

  it("queda cobrado al saldar", async () => {
    await m.pedidos.registrarCobro({ pedidoId, montoCentavos: 4500000, medio: "banco", fecha: HOY });
    const p = (await m.pedidos.listarPedidos({ clienteId })).find((x) => x.id === pedidoId)!;
    expect(m.pedidos.estadoCobro(p)).toBe("cobrado");
    expect(m.pedidos.saldoPedido(p)).toBe(0);
  });

  it("informa lo que deben los comercios", async () => {
    const otro = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 4 }] });
    await m.pedidos.cambiarEstado(otro, "entregado");

    const deuda = (await m.pedidos.cuentasPorCobrar()).find((d) => d.pedidoId === otro)!;
    expect(deuda.saldoCentavos).toBe(3000000);
    expect(deuda.comercio).toBe("Almacén La Esquina");
  });

  it("no cuenta como deuda un pedido que todavía no se entregó", async () => {
    const abierto = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 2 }] });
    expect((await m.pedidos.cuentasPorCobrar()).some((d) => d.pedidoId === abierto)).toBe(false);
  });
});

describe("gastos y pagos contra la caja", () => {
  it("un gasto sale de la caja por el medio con que se pagó", async () => {
    const categoria = await m.gastos.crearCategoria("Transporte", "logistico");
    const antes = await m.caja.saldos();

    await m.gastos.crearGasto({
      categoriaId: categoria, fecha: HOY, montoCentavos: 1500000,
      descripcion: "Flete a zona oeste", medioPago: "efectivo",
    });

    expect((await m.caja.saldos()).efectivo).toBe(antes.efectivo - 1500000);
  });

  it("borrar el gasto también le devuelve la plata a la caja", async () => {
    const categoria = await m.gastos.crearCategoria("Varios", "operativo");
    const antes = await m.caja.saldos();
    const gasto = await m.gastos.crearGasto({
      categoriaId: categoria, fecha: HOY, montoCentavos: 500000, medioPago: "banco",
    });
    expect((await m.caja.saldos()).banco).toBe(antes.banco - 500000);

    await m.gastos.eliminarGasto(gasto);
    expect((await m.caja.saldos()).banco).toBe(antes.banco);
  });

  it("pagarle al proveedor sale de la caja", async () => {
    const compra = await m.compras.crearCompra({
      proveedorId, fecha: HOY,
      items: [{ productoId, cantidad: 10, costoUnitNetoCentavos: 400000, ivaAlicuota: 2100 }],
    });
    await m.compras.confirmarCompra(compra);

    const antes = await m.caja.saldos();
    await m.compras.registrarPago(compra, 2000000, "banco", HOY);
    expect((await m.caja.saldos()).banco).toBe(antes.banco - 2000000);
  });

  it("no deja borrar a mano un movimiento que vino de otro lado", async () => {
    const delGasto = (await m.caja.listarMovimientos()).find((x) => x.gastoId)!;
    await expect(m.caja.eliminarMovimiento(delGasto.id)).rejects.toThrow(m.caja.ErrorCaja);
  });
});

describe("flujo del período", () => {
  it("separa lo que entró de lo que salió y cierra contra el saldo", async () => {
    const f = await m.caja.flujo({ desde: `${HOY.slice(0, 7)}-01`, hasta: `${HOY.slice(0, 7)}-31` });
    expect(f.ingresosCentavos).toBeGreaterThan(0);
    expect(f.egresosCentavos).toBeGreaterThan(0);
    expect(f.netoCentavos).toBe(f.ingresosCentavos - f.egresosCentavos);
    expect(f.saldoFinal.total).toBe((await m.caja.saldos()).total);
  });
});

describe("cartera de clientes", () => {
  it("resume cuánto compró y cuánto debe cada comercio", async () => {
    const met = await m.clientes.metricasDeCliente(clienteId, HOY);
    expect(met.pedidos).toBe(3);
    expect(met.entregados).toBe(2);
    // 10 + 4 entregados y 2 pendientes, todos a 7.500
    expect(met.totalCompradoCentavos).toBe(16 * 750000);
    expect(met.saldoCentavos).toBe(3000000); // solo el entregado sin cobrar
    expect(met.ticketPromedioCentavos).toBe(Math.round((16 * 750000) / 3));
    expect(met.ultimaCompra).toBe(HOY);
    expect(met.diasSinComprar).toBe(0);
  });

  it("no inventa una frecuencia con un solo pedido", async () => {
    const nuevo = await m.clientes.crearCliente({ comercio: "Kiosco Nuevo" });
    await m.pedidos.crearPedido({ clienteId: nuevo, fecha: HOY, items: [{ productoId, cantidad: 1 }] });
    expect((await m.clientes.metricasDeCliente(nuevo, HOY)).diasEntreCompras).toBeNull();
  });

  it("deja en cero a un comercio que todavía no compró", async () => {
    const nuevo = await m.clientes.crearCliente({ comercio: "Sin compras" });
    const met = await m.clientes.metricasDeCliente(nuevo, HOY);
    expect(met.pedidos).toBe(0);
    expect(met.ultimaCompra).toBeNull();
  });
});

describe("listas de precio por comercio", () => {
  it("cotiza con la lista asignada al comercio", async () => {
    const general = (await m.precios.listaPredeterminada())!;
    await m.precios.crearEscala({
      listaId: general.id, productoId, nombre: "+10", desdeCantidad: 10, precioCentavos: 700000,
    });

    const distribuidor = await m.precios.crearLista("Distribuidor");
    await m.precios.crearEscala({
      listaId: distribuidor, productoId, nombre: "Distribuidor", desdeCantidad: 1, precioCentavos: 550000,
    });

    const especial = await m.clientes.crearCliente({ comercio: "Mayorista Sur", tipo: "distribuidor" });
    await m.clientes.actualizarCliente(especial, { listaPrecioId: distribuidor });

    const comun = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 10 }] });
    const propio = await m.pedidos.crearPedido({ clienteId: especial, fecha: HOY, items: [{ productoId, cantidad: 10 }] });

    expect((await m.pedidos.obtenerPedido(comun))!.items[0].precioUnitCentavos).toBe(700000);
    expect((await m.pedidos.obtenerPedido(propio))!.items[0].precioUnitCentavos).toBe(550000);
  });

  it("no deja borrar la lista predeterminada", async () => {
    const general = (await m.precios.listaPredeterminada())!;
    await expect(m.precios.eliminarLista(general.id)).rejects.toThrow(m.precios.ErrorPrecio);
  });

  it("no deja borrar una lista que algún comercio tiene asignada", async () => {
    const distribuidor = (await m.precios.listarListas()).find((l) => l.nombre === "Distribuidor")!;
    await expect(m.precios.eliminarLista(distribuidor.id)).rejects.toThrow(/comercios/);
  });
});
