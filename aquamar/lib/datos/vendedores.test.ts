import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { hoy } from "../formato";

/**
 * Vendedores, comisiones y a quién pertenece cada comercio. Lo que se liquida
 * tiene que ser exactamente lo que se vendió, aunque después cambien las reglas.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-vend-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  clientes: typeof import("./clientes");
  pedidos: typeof import("./pedidos");
  precios: typeof import("./precios");
  productos: typeof import("./productos");
  vendedores: typeof import("./vendedores");
};

let m: Modulos;
let productoId: string;

const HOY = hoy();
const RANGO = { desde: `${HOY.slice(0, 7)}-01`, hasta: `${HOY.slice(0, 7)}-31` };

beforeAll(async () => {
  m = {
    clientes: await import("./clientes"),
    pedidos: await import("./pedidos"),
    precios: await import("./precios"),
    productos: await import("./productos"),
    vendedores: await import("./vendedores"),
  };

  productoId = await m.productos.crearProducto({
    nombre: "Powerful 3 en 1",
    stock: 1000,
    costoCentavos: 450000,
    precioCentavos: 750000,
  });
});

describe("comisión de un renglón", () => {
  it("paga un bulto entero por un bulto entero", () => {
    expect(m.vendedores.comisionDeRenglon(12, 12, 50000)).toBe(50000);
    expect(m.vendedores.comisionDeRenglon(120, 12, 50000)).toBe(500000);
  });

  /*
   * Media docena de un bulto de doce paga media comisión: cobrar el bulto
   * entero por seis envases sería regalar plata, y no pagar nada sería
   * quitársela al vendedor.
   */
  it("prorratea las unidades sueltas", () => {
    expect(m.vendedores.comisionDeRenglon(6, 12, 50000)).toBe(25000);
    expect(m.vendedores.comisionDeRenglon(1, 12, 50000)).toBe(4167);
  });

  it("no paga nada sin comisión cargada", () => {
    expect(m.vendedores.comisionDeRenglon(120, 12, 0)).toBe(0);
    expect(m.vendedores.comisionDeRenglon(0, 12, 50000)).toBe(0);
  });
});

describe("alta de vendedor", () => {
  it("no acepta uno sin nombre", async () => {
    await expect(m.vendedores.crearVendedor({ nombre: "  " })).rejects.toThrow(m.vendedores.ErrorVendedor);
  });

  it("no acepta una comisión negativa", async () => {
    await expect(
      m.vendedores.crearVendedor({ nombre: "Prueba", comisionPorBultoCentavos: -1 }),
    ).rejects.toThrow(m.vendedores.ErrorVendedor);
  });

  it("no acepta una modalidad inventada", async () => {
    await expect(
      // @ts-expect-error justamente se prueba que el valor de afuera no pasa
      m.vendedores.crearVendedor({ nombre: "Prueba", modalidad: "socio" }),
    ).rejects.toThrow(m.vendedores.ErrorVendedor);
  });
});

describe("pedido de un vendedor a comisión", () => {
  let vendedorId: string;
  let clienteId: string;
  let pedidoId: string;

  beforeAll(async () => {
    vendedorId = await m.vendedores.crearVendedor({
      nombre: "Mati Titán",
      color: "naranja",
      modalidad: "comisión",
      comisionPorBultoCentavos: 50000, // $500 el bulto
    });
    clienteId = await m.clientes.crearCliente({ comercio: "Kiosco de Mati" });
    await m.clientes.actualizarCliente(clienteId, { vendedorId });

    // 10 bultos de a 12: 120 unidades.
    pedidoId = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 120 }] });
  });

  it("le queda pegado el vendedor y su comisión", async () => {
    const pedido = (await m.pedidos.obtenerPedido(pedidoId))!;
    expect(pedido.vendedorId).toBe(vendedorId);
    expect(pedido.comisionCentavos).toBe(500000);
  });

  it("no se liquida hasta que se entrega", async () => {
    const antes = (await m.vendedores.liquidacion(RANGO)).find((l) => l.vendedor.id === vendedorId)!;
    expect(antes.comisionCentavos).toBe(0);
    expect(antes.comercios).toBe(1);

    await m.pedidos.cambiarEstado(pedidoId, "entregado");

    const despues = (await m.vendedores.liquidacion(RANGO)).find((l) => l.vendedor.id === vendedorId)!;
    expect(despues.comisionCentavos).toBe(500000);
    expect(despues.pedidos).toBe(1);
    expect(despues.unidades).toBe(120);
    expect(despues.ventasCentavos).toBe(120 * 750000);
  });

  /*
   * Lo importante de congelar: subirle la comisión a alguien no puede cambiar
   * lo que ya se le debía por lo vendido el mes pasado.
   */
  it("subirle la comisión no cambia lo ya vendido", async () => {
    await m.vendedores.actualizarVendedor(vendedorId, { comisionPorBultoCentavos: 100000 });

    const igual = (await m.vendedores.liquidacion(RANGO)).find((l) => l.vendedor.id === vendedorId)!;
    expect(igual.comisionCentavos).toBe(500000);

    // El pedido nuevo sí sale con la comisión nueva.
    const otro = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 12 }] });
    expect((await m.pedidos.obtenerPedido(otro))!.comisionCentavos).toBe(100000);
  });

  it("borrar el pedido se lleva su comisión", async () => {
    const otro = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 12 }] });
    await m.pedidos.cambiarEstado(otro, "entregado");
    const con = (await m.vendedores.liquidacion(RANGO)).find((l) => l.vendedor.id === vendedorId)!;

    await m.pedidos.eliminarPedido(otro);
    const sin = (await m.vendedores.liquidacion(RANGO)).find((l) => l.vendedor.id === vendedorId)!;
    expect(sin.comisionCentavos).toBe(con.comisionCentavos - 100000);
  });
});

describe("sub-distribuidor", () => {
  it("no genera comisión, pero sus comercios quedan identificados", async () => {
    const vendedorId = await m.vendedores.crearVendedor({
      nombre: "Distribuidora del Oeste",
      modalidad: "sub-distribuidor",
      // Aunque tenga un número cargado, su modalidad manda: no se le liquida.
      comisionPorBultoCentavos: 90000,
    });
    const clienteId = await m.clientes.crearCliente({ comercio: "Almacén del Oeste" });
    await m.clientes.actualizarCliente(clienteId, { vendedorId });

    const pedidoId = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 120 }] });
    await m.pedidos.cambiarEstado(pedidoId, "entregado");

    const linea = (await m.vendedores.liquidacion(RANGO)).find((l) => l.vendedor.id === vendedorId)!;
    expect(linea.comisionCentavos).toBe(0);
    expect(linea.comercios).toBe(1);
    expect(linea.unidades).toBe(120);
  });
});

describe("lista de precios del vendedor", () => {
  it("cotiza los comercios del vendedor con la lista del vendedor", async () => {
    const listaId = await m.precios.crearLista("Precios de Mati");
    await m.precios.crearEscala({
      listaId,
      productoId,
      nombre: "Mati",
      desdeCantidad: 1,
      precioCentavos: 600000,
    });

    const vendedorId = await m.vendedores.crearVendedor({ nombre: "Mati con lista", listaPrecioId: listaId });
    const clienteId = await m.clientes.crearCliente({ comercio: "Comercio con lista de Mati" });
    await m.clientes.actualizarCliente(clienteId, { vendedorId });

    expect(await m.precios.listaDeCliente(clienteId)).toBe(listaId);

    const pedidoId = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 12 }] });
    expect((await m.pedidos.obtenerPedido(pedidoId))!.items[0].precioUnitCentavos).toBe(600000);
  });

  /* La del comercio gana: es la más específica de las tres. */
  it("la lista propia del comercio le gana a la del vendedor", async () => {
    const listaVendedor = await m.precios.crearLista("Lista del vendedor");
    const listaComercio = await m.precios.crearLista("Lista del comercio");
    const vendedorId = await m.vendedores.crearVendedor({ nombre: "Otro", listaPrecioId: listaVendedor });
    const clienteId = await m.clientes.crearCliente({ comercio: "Comercio con lista propia" });
    await m.clientes.actualizarCliente(clienteId, { vendedorId, listaPrecioId: listaComercio });

    expect(await m.precios.listaDeCliente(clienteId)).toBe(listaComercio);
  });
});
