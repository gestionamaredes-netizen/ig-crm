import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { hoy } from "../formato";

/**
 * El cierre de período es lo único del sistema que borra en masa. Lo que se
 * prueba acá no es tanto que borre, sino dónde se detiene: qué se lleva, qué
 * deja intacto, y que la foto quede guardada antes de vaciar nada.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-cierre-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  bitacora: typeof import("./bitacora");
  caja: typeof import("./caja");
  cierre: typeof import("./cierre");
  clientes: typeof import("./clientes");
  gastos: typeof import("./gastos");
  pedidos: typeof import("./pedidos");
  precios: typeof import("./precios");
  productos: typeof import("./productos");
  stock: typeof import("./stock");
  vendedores: typeof import("./vendedores");
};

let m: Modulos;
let productoId: string;
let clienteId: string;
let vendedorId: string;

const HOY = hoy();

beforeAll(async () => {
  m = {
    bitacora: await import("./bitacora"),
    caja: await import("./caja"),
    cierre: await import("./cierre"),
    clientes: await import("./clientes"),
    gastos: await import("./gastos"),
    pedidos: await import("./pedidos"),
    precios: await import("./precios"),
    productos: await import("./productos"),
    stock: await import("./stock"),
    vendedores: await import("./vendedores"),
  };

  // Un mes de actividad: producto, comercio, vendedor, pedido entregado y
  // cobrado a medias, un gasto y un movimiento de caja.
  productoId = await m.productos.crearProducto({
    nombre: "Powerful 3 en 1",
    stock: 600,
    costoCentavos: 450000,
    precioCentavos: 750000,
  });
  vendedorId = await m.vendedores.crearVendedor({
    nombre: "Mati Titán",
    modalidad: "comisión",
    comisionPorBultoCentavos: 50000,
  });
  clienteId = await m.clientes.crearCliente({ comercio: "Kiosco de prueba", comisionistaId: vendedorId });

  const pedidoId = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 120 }] });
  await m.pedidos.cambiarEstado(pedidoId, "entregado");
  await m.pedidos.registrarCobro({ pedidoId, montoCentavos: 300000, forma: "efectivo", fecha: HOY });
  await m.bitacora.anotar({ actor: "admin", accion: "Algo que pasó antes del cierre", entidad: "pedido" });
});

describe("la foto antes de cerrar", () => {
  it("cuenta lo que se movió sin tocar nada", async () => {
    const r = await m.cierre.resumenDelPeriodo();

    expect(r.pedidos.entregados).toBe(1);
    expect(r.pedidos.unidades).toBe(120);
    expect(r.pedidos.facturadoCentavos).toBe(120 * 750000);
    expect(r.pedidos.cobradoCentavos).toBe(300000);
    // Se entregaron 120 de 600: quedan 480, y la salida figura como tal.
    const p = r.productos.find((x) => x.nombre === "Powerful 3 en 1")!;
    expect(p.stockFinal).toBe(480);
    expect(p.salidas).toBe(120);
    expect(p.entradas).toBe(600);

    // Mirar no cambia el stock.
    expect((await m.productos.obtenerProducto(productoId))!.stock).toBe(480);
  });

  it("deja anotado lo que queda debiendo el comercio", async () => {
    const r = await m.cierre.resumenDelPeriodo();
    expect(r.deudas.comercios).toBe(1);
    expect(r.deudas.totalCentavos).toBe(120 * 750000 - 300000);
  });

  it("y lo que se le debe al vendedor", async () => {
    const r = await m.cierre.resumenDelPeriodo();
    const c = r.comisiones.find((x) => x.vendedor === "Mati Titán")!;
    expect(c.ganadoCentavos).toBe(500000);
    expect(c.saldoCentavos).toBe(500000);
  });
});

describe("cerrar sin confirmar", () => {
  it("no hace nada sin la palabra", async () => {
    await expect(
      m.cierre.cerrarPeriodo({ periodo: "Septiembre", hechoPor: "Kevin A", confirmacion: "" }),
    ).rejects.toThrow(m.cierre.ErrorCierre);
    await expect(
      m.cierre.cerrarPeriodo({ periodo: "Septiembre", hechoPor: "Kevin A", confirmacion: "dale" }),
    ).rejects.toThrow(m.cierre.ErrorCierre);
    // Y el sistema sigue entero.
    expect((await m.productos.obtenerProducto(productoId))!.stock).toBe(480);
  });

  it("tampoco sin nombre de período", async () => {
    await expect(
      m.cierre.cerrarPeriodo({ periodo: "   ", hechoPor: "Kevin A", confirmacion: "CERRAR" }),
    ).rejects.toThrow(m.cierre.ErrorCierre);
  });
});

describe("el cierre", () => {
  let cierreId: string;

  it("guarda la foto y vacía el sistema", async () => {
    const hecho = await m.cierre.cerrarPeriodo({
      periodo: "Septiembre 2026",
      hechoPor: "Kevin A",
      nota: "Arrancamos octubre con lista nueva",
      confirmacion: "CERRAR",
    });
    cierreId = hecho.id;

    // La foto quedó con los números de antes de borrar.
    expect(hecho.resumen.pedidos.entregados).toBe(1);
    expect(hecho.resumen.productos[0].stockFinal).toBe(480);

    // Y el sistema quedó limpio.
    expect(await m.pedidos.listarPedidos()).toHaveLength(0);
    expect((await m.caja.saldos()).total).toBe(0);
    expect(await m.stock.listarMovimientos()).toHaveLength(0);
  });

  it("el stock, el costo y el precio quedan en cero", async () => {
    const p = (await m.productos.obtenerProducto(productoId))!;
    expect(p.stock).toBe(0);
    expect(p.costoCentavos).toBe(0);
    expect(p.ultimoCostoCentavos).toBe(0);
    expect(p.precioCentavos).toBe(0);
  });

  /*
   * Lo que tiene que sobrevivir: las fichas. Volver a cargar los comercios uno
   * por uno, con sus links de acceso, sería el mes que viene un día de trabajo.
   */
  it("las fichas quedan: comercios, productos y vendedores", async () => {
    expect((await m.productos.obtenerProducto(productoId))!.nombre).toBe("Powerful 3 en 1");
    const cliente = (await m.clientes.obtenerCliente(clienteId))!;
    expect(cliente.comercio).toBe("Kiosco de prueba");
    expect(cliente.comisionistaId).toBe(vendedorId);
    expect((await m.clientes.listarAccesos(clienteId)).length).toBeGreaterThan(0);

    const v = (await m.vendedores.obtenerVendedor(vendedorId))!;
    expect(v.nombre).toBe("Mati Titán");
    expect(v.comisionPorBultoCentavos).toBe(50000);
  });

  it("la bitácora no se toca: es el registro de quién hizo qué", async () => {
    const anotaciones = await m.bitacora.listarBitacora({ limite: 100 });
    expect(anotaciones.some((a) => a.accion === "Algo que pasó antes del cierre")).toBe(true);
  });

  it("el cierre queda guardado y se puede volver a leer", async () => {
    const guardado = (await m.cierre.obtenerCierre(cierreId))!;
    expect(guardado.periodo).toBe("Septiembre 2026");
    expect(guardado.hechoPor).toBe("Kevin A");
    expect(guardado.datos.pedidos.facturadoCentavos).toBe(120 * 750000);
    expect(guardado.datos.deudas.totalCentavos).toBe(120 * 750000 - 300000);

    expect((await m.cierre.listarCierres())).toHaveLength(1);
  });

  /*
   * Después de cerrar, todo vale cero. Si alguien carga un pedido antes de
   * poner la lista nueva, vende gratis: el sistema tiene que poder avisarlo.
   */
  it("avisa que faltan los precios", async () => {
    expect(await m.cierre.faltanPrecios()).toBe(1);
    await m.productos.actualizarProducto(productoId, { precioCentavos: 800000 });
    expect(await m.cierre.faltanPrecios()).toBe(0);
  });

  it("cerrar de nuevo con el sistema vacío no rompe", async () => {
    const otro = await m.cierre.cerrarPeriodo({
      periodo: "Octubre 2026",
      hechoPor: "Kevin A",
      confirmacion: "CERRAR",
    });
    expect(otro.resumen.pedidos.total).toBe(0);
    expect(await m.cierre.listarCierres()).toHaveLength(2);
  });
});
