import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { hoy } from "../formato";

/**
 * Las dos cosas que el sistema no puede confundir: la plata que hay y la plata
 * que se ganó. Y que actualizar un costo hoy no cambie lo que se ganó ayer.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-resultado-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  caja: typeof import("./caja");
  clientes: typeof import("./clientes");
  compras: typeof import("./compras");
  config: typeof import("./config");
  gastos: typeof import("./gastos");
  pedidos: typeof import("./pedidos");
  productos: typeof import("./productos");
  proveedores: typeof import("./proveedores");
  reportes: typeof import("./reportes");
  stock: typeof import("./stock");
};

let m: Modulos;
let clienteId: string;
let proveedorId: string;

const HOY = hoy();
const RANGO = { desde: `${HOY.slice(0, 7)}-01`, hasta: `${HOY.slice(0, 7)}-31` };

beforeAll(async () => {
  m = {
    caja: await import("./caja"),
    clientes: await import("./clientes"),
    compras: await import("./compras"),
    config: await import("./config"),
    gastos: await import("./gastos"),
    pedidos: await import("./pedidos"),
    productos: await import("./productos"),
    proveedores: await import("./proveedores"),
    reportes: await import("./reportes"),
    stock: await import("./stock"),
  };
  clienteId = await m.clientes.crearCliente({ comercio: "Kiosco de la esquina" });
  proveedorId = await m.proveedores.crearProveedor({ nombre: "Powerful SA" });
});

describe("la caja no es la ganancia", () => {
  it("un pase entre efectivo y banco no entra ni sale del negocio", async () => {
    await m.caja.registrarManual({ montoCentavos: 1000000, medio: "efectivo", concepto: "Saldo inicial", fecha: HOY });
    const antes = await m.caja.flujo(RANGO);

    await m.caja.transferir({ desde: "efectivo", hacia: "banco", montoCentavos: 400000, fecha: HOY });
    const despues = await m.caja.flujo(RANGO);

    // Ni un peso más de ingreso ni de egreso: la plata cambió de lugar.
    expect(despues.ingresosCentavos).toBe(antes.ingresosCentavos);
    expect(despues.egresosCentavos).toBe(antes.egresosCentavos);
    expect(despues.pasesCentavos).toBe(400000);
    // Y el disponible total no se movió, solo se repartió distinto.
    expect(despues.saldoFinal.total).toBe(antes.saldoFinal.total);
    expect(despues.saldoFinal.efectivo).toBe(600000);
    expect(despues.saldoFinal.banco).toBe(400000);
  });

  it("un aporte del dueño mueve el disponible sin ser un ingreso del negocio", async () => {
    const antes = await m.caja.flujo(RANGO);
    await m.caja.registrarCapital({
      montoCentavos: 5000000,
      medio: "banco",
      concepto: "Aporte para reponer mercadería",
      fecha: HOY,
    });
    const despues = await m.caja.flujo(RANGO);

    expect(despues.ingresosCentavos).toBe(antes.ingresosCentavos);
    expect(despues.capitalCentavos).toBe(5000000);
    expect(despues.saldoFinal.total).toBe(antes.saldoFinal.total + 5000000);
  });

  it("un retiro del dueño no es un gasto operativo", async () => {
    await m.caja.registrarCapital({
      montoCentavos: -2000000,
      medio: "banco",
      concepto: "Retiro de Kevin",
      fecha: HOY,
    });
    const f = await m.caja.flujo(RANGO);
    expect(f.capitalCentavos).toBe(5000000 - 2000000);

    // En el resultado no aparece por ningún lado: no es una venta ni un gasto.
    const r = await m.reportes.resumen(RANGO);
    expect(r.gastosCentavos).toBe(0);
  });

  it("un aporte o retiro sin concepto no se guarda", async () => {
    await expect(
      m.caja.registrarCapital({ montoCentavos: 1000, medio: "efectivo", concepto: "  " }),
    ).rejects.toThrow(/necesita un concepto/);
  });
});

describe("comprar mercadería no es un gasto", () => {
  it("la compra saca plata de la caja pero no baja el resultado", async () => {
    const productoId = await m.productos.crearProducto({
      nombre: "Powerful 40 cápsulas",
      presentacion: "Caja x 12",
      stock: 0,
      costoCentavos: 0,
      precioCentavos: 750000,
    });
    const compraId = await m.compras.crearCompra({
      proveedorId,
      fecha: HOY,
      items: [{ productoId, cantidad: 100, costoUnitNetoCentavos: 450000, ivaAlicuota: 2100 }],
    });
    await m.compras.confirmarCompra(compraId);
    await m.compras.registrarPago(compraId, 10000000, "banco", HOY);

    const f = await m.caja.flujo(RANGO);
    expect(f.egresosCentavos).toBe(10000000); // la plata salió de verdad

    // Pero no es un gasto: todavía es mercadería en el depósito. Recién
    // cuando se venda pesará, y como costo de esa venta.
    const r = await m.reportes.resumen(RANGO);
    expect(r.gastosCentavos).toBe(0);
    expect(r.costoCentavos).toBe(0);
  });
});

describe("los impuestos no se descuentan dos veces", () => {
  it("el pago de Ingresos Brutos no baja otra vez el resultado operativo", async () => {
    const categoria = await m.gastos.crearCategoria("Ingresos Brutos", "impuesto");
    await m.gastos.crearGasto({ categoriaId: categoria, fecha: HOY, montoCentavos: 300000 });

    const r = await m.reportes.resumen(RANGO);
    // Sale de la caja y queda registrado…
    expect(r.impuestosPagadosCentavos).toBe(300000);
    // …pero no entra en los gastos que bajan el resultado operativo, porque
    // IIBB ya se descuenta estimado sobre las ventas del período.
    expect(r.gastosCentavos).toBe(0);
    expect(r.resultadoOperativoCentavos).toBe(r.margenBrutoCentavos);
  });

  it("un gasto operativo común sí baja el resultado", async () => {
    const categoria = await m.gastos.crearCategoria("Combustible", "operativo");
    await m.gastos.crearGasto({ categoriaId: categoria, fecha: HOY, montoCentavos: 500000 });

    const r = await m.reportes.resumen(RANGO);
    expect(r.gastosCentavos).toBe(500000);
    expect(r.resultadoOperativoCentavos).toBe(r.margenBrutoCentavos - 500000);
  });
});

describe("el costo de una venta queda congelado", () => {
  it("actualizar el costo de compra no cambia la ganancia de lo ya entregado", async () => {
    const productoId = await m.productos.crearProducto({
      nombre: "Powerful 20 cápsulas",
      presentacion: "Caja x 12",
      stock: 100,
      costoCentavos: 400000,
      precioCentavos: 700000,
    });

    const pedidoId = await m.pedidos.crearPedido({
      clienteId,
      fecha: HOY,
      items: [{ productoId, cantidad: 10 }],
    });
    await m.pedidos.cambiarEstado(pedidoId, "entregado");

    const antes = (await m.reportes.rentabilidadPorPedido(RANGO)).find((p) => p.id === pedidoId)!;
    expect(antes.costoCentavos).toBe(10 * 400000);

    // El proveedor aumenta y entra una compra más cara: el costo del producto
    // sube para las ventas que vienen, no para las que ya pasaron.
    const compraId = await m.compras.crearCompra({
      proveedorId,
      fecha: HOY,
      items: [{ productoId, cantidad: 200, costoUnitNetoCentavos: 900000, ivaAlicuota: 2100 }],
    });
    await m.compras.confirmarCompra(compraId);
    expect((await m.productos.obtenerProducto(productoId))!.costoCentavos).toBeGreaterThan(400000);

    const despues = (await m.reportes.rentabilidadPorPedido(RANGO)).find((p) => p.id === pedidoId)!;
    expect(despues.costoCentavos).toBe(antes.costoCentavos);
    expect(despues.margenCentavos).toBe(antes.margenCentavos);
  });

  it("tampoco lo cambia editar el costo a mano", async () => {
    const productoId = await m.productos.crearProducto({
      nombre: "Powerful edición a mano",
      presentacion: "Caja x 12",
      stock: 50,
      costoCentavos: 300000,
      precioCentavos: 600000,
    });
    const pedidoId = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 5 }] });
    await m.pedidos.cambiarEstado(pedidoId, "entregado");

    const antes = (await m.reportes.rentabilidadPorPedido(RANGO)).find((p) => p.id === pedidoId)!;
    await m.productos.actualizarProducto(productoId, { costoCentavos: 999999 });

    const despues = (await m.reportes.rentabilidadPorPedido(RANGO)).find((p) => p.id === pedidoId)!;
    expect(despues.costoCentavos).toBe(antes.costoCentavos);
  });
});

describe("un gasto imputado a un pedido no se cuenta dos veces", () => {
  it("pesa una sola vez en el resultado del período", async () => {
    const productoId = await m.productos.crearProducto({
      nombre: "Powerful imputación",
      presentacion: "Caja x 12",
      stock: 100,
      costoCentavos: 400000,
      precioCentavos: 700000,
    });
    const pedidoId = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 10 }] });
    await m.pedidos.cambiarEstado(pedidoId, "entregado");

    const antes = await m.reportes.resumen(RANGO);
    const flete = await m.gastos.crearCategoria("Flete del pedido", "logistico");
    await m.gastos.crearGasto({ categoriaId: flete, fecha: HOY, montoCentavos: 120000, pedidoId });
    const despues = await m.reportes.resumen(RANGO);

    // Entra una vez a los gastos del período, no dos por estar imputado.
    expect(despues.gastosCentavos).toBe(antes.gastosCentavos + 120000);
    expect(despues.gastosLogisticos).toBe(antes.gastosLogisticos + 120000);
    expect(despues.gastosImputadosAPedidos).toBe(antes.gastosImputadosAPedidos + 120000);
    expect(despues.resultadoOperativoCentavos).toBe(antes.resultadoOperativoCentavos - 120000);
  });

  it("en la tabla de pedidos se muestra contra ese pedido, no sumado aparte", async () => {
    const pedido = (await m.reportes.rentabilidadPorPedido(RANGO)).find((p) => p.gastosCentavos === 120000)!;
    expect(pedido.margenCentavos).toBe(pedido.ventaNetaCentavos - pedido.costoCentavos - 120000);
  });
});

describe("el resultado respeta el período elegido", () => {
  it("un gasto de otro mes no entra en el resultado de este", async () => {
    const categoria = await m.gastos.crearCategoria("Alquiler viejo", "operativo");
    const antes = await m.reportes.resumen(RANGO);
    await m.gastos.crearGasto({
      categoriaId: categoria,
      fecha: `${Number(HOY.slice(0, 4)) - 1}-06-15`,
      montoCentavos: 9999900,
    });
    const despues = await m.reportes.resumen(RANGO);
    expect(despues.gastosCentavos).toBe(antes.gastosCentavos);
  });

  it("un rango de un solo día trae solo lo de ese día", async () => {
    const soloHoy = await m.reportes.resumen({ desde: HOY, hasta: HOY });
    const delMes = await m.reportes.resumen(RANGO);
    // Todo lo de estas pruebas se carga con fecha de hoy, así que tienen que
    // coincidir: lo que importa es que el rango se aplique de verdad.
    expect(soloHoy.ventaNetaCentavos).toBe(delMes.ventaNetaCentavos);

    const ayer = new Date(`${HOY}T00:00:00Z`);
    ayer.setUTCDate(ayer.getUTCDate() - 1);
    const vacio = await m.reportes.resumen({ desde: ayer.toISOString().slice(0, 10), hasta: ayer.toISOString().slice(0, 10) });
    expect(vacio.ventaNetaCentavos).toBe(0);
    expect(vacio.gastosCentavos).toBe(0);
  });
});
