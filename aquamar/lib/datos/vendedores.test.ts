import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { formatearPesos, hoy } from "../formato";

/**
 * Vendedores, comisiones y a quién pertenece cada comercio. Lo que se liquida
 * tiene que ser exactamente lo que se vendió, aunque después cambien las reglas.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-vend-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  caja: typeof import("./caja");
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
    caja: await import("./caja"),
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

/*
 * Pagarle al vendedor es plata que sale: tiene que salir de la caja en el mismo
 * movimiento, y la deuda tiene que bajar exactamente en lo que se pagó. Si las
 * dos cuentas no se mueven juntas, una de las dos miente.
 */
describe("pago de la comisión", () => {
  let vendedorId: string;
  let clienteId: string;

  const saldo = async () => (await m.vendedores.liquidacion(RANGO)).find((l) => l.vendedor.id === vendedorId)!;

  beforeAll(async () => {
    vendedorId = await m.vendedores.crearVendedor({
      nombre: "Vendedor a liquidar",
      modalidad: "comisión",
      comisionPorBultoCentavos: 50000,
    });
    clienteId = await m.clientes.crearCliente({ comercio: "Comercio a liquidar" });
    await m.clientes.actualizarCliente(clienteId, { vendedorId });

    // 240 unidades = 20 bultos = $10.000 de comisión.
    const pedidoId = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 240 }] });
    await m.pedidos.cambiarEstado(pedidoId, "entregado");
  });

  it("sale de la caja y baja la deuda", async () => {
    const antes = await saldo();
    expect(antes.saldoCentavos).toBe(1000000);

    const cajaAntes = await m.caja.saldos();
    await m.vendedores.registrarPagoComision({
      vendedorId,
      montoCentavos: 400000,
      forma: "efectivo",
      fecha: HOY,
    });

    const cajaDespues = await m.caja.saldos();
    expect(cajaDespues.efectivo).toBe(cajaAntes.efectivo - 400000);

    const despues = await saldo();
    expect(despues.pagadoCentavos).toBe(400000);
    expect(despues.saldoCentavos).toBe(600000);
    // Lo ganado en el período no cambia: pagar no deshace lo vendido.
    expect(despues.comisionCentavos).toBe(1000000);
  });

  it("una transferencia sale del banco, no del efectivo", async () => {
    const antes = await m.caja.saldos();
    await m.vendedores.registrarPagoComision({
      vendedorId,
      montoCentavos: 100000,
      forma: "transferencia",
      fecha: HOY,
    });
    const despues = await m.caja.saldos();
    expect(despues.banco).toBe(antes.banco - 100000);
    expect(despues.efectivo).toBe(antes.efectivo);
    expect((await saldo()).saldoCentavos).toBe(500000);
  });

  it("no acepta un pago en cero ni negativo", async () => {
    await expect(
      m.vendedores.registrarPagoComision({ vendedorId, montoCentavos: 0, forma: "efectivo" }),
    ).rejects.toThrow(m.vendedores.ErrorVendedor);
  });

  it("no deja liquidarle a un sub-distribuidor", async () => {
    const otro = await m.vendedores.crearVendedor({ nombre: "Revende", modalidad: "sub-distribuidor" });
    await expect(
      m.vendedores.registrarPagoComision({ vendedorId: otro, montoCentavos: 100000, forma: "efectivo" }),
    ).rejects.toThrow(m.vendedores.ErrorVendedor);
  });

  it("borrar un pago cargado mal devuelve la plata a la caja", async () => {
    const cajaAntes = await m.caja.saldos();
    const deudaAntes = (await saldo()).saldoCentavos;

    const pagoId = await m.vendedores.registrarPagoComision({
      vendedorId,
      montoCentavos: 250000,
      forma: "efectivo",
      fecha: HOY,
    });
    expect((await saldo()).saldoCentavos).toBe(deudaAntes - 250000);

    await m.vendedores.eliminarPagoComision(pagoId);
    expect((await m.caja.saldos()).efectivo).toBe(cajaAntes.efectivo);
    expect((await saldo()).saldoCentavos).toBe(deudaAntes);
  });

  it("el movimiento del pago no se puede borrar a mano desde la caja", async () => {
    await m.vendedores.registrarPagoComision({ vendedorId, montoCentavos: 50000, forma: "efectivo", fecha: HOY });
    const mov = (await m.caja.listarMovimientos({ limite: 200 })).find((x) => x.pagoComisionId)!;
    await expect(m.caja.eliminarMovimiento(mov.id)).rejects.toThrow(m.caja.ErrorCaja);
  });

  it("tampoco lo cuenta como un cobro de comercio", async () => {
    const porForma = await m.caja.cobrosPorForma(RANGO);
    const sumado = porForma.reduce((a, f) => a + f.totalCentavos, 0);
    // Todo lo que suma en "cómo te pagaron" tiene que venir de pedidos cobrados,
    // y a los vendedores no se les cobra: se les paga.
    const pedidos = await m.pedidos.listarPedidos();
    expect(sumado).toBe(pedidos.reduce((a, p) => a + p.cobradoCentavos, 0));
  });
});

/*
 * Pagarle de más no es un error: a veces se le adelanta plata. Pero la cuenta
 * tiene que quedar del lado correcto, para que el mes siguiente se descuente
 * sola en vez de pagarle dos veces lo mismo.
 */
describe("adelantos", () => {
  it("pagar de más deja saldo a favor del vendedor", async () => {
    const vendedorId = await m.vendedores.crearVendedor({
      nombre: "Con adelanto",
      modalidad: "comisión",
      comisionPorBultoCentavos: 50000,
    });
    const clienteId = await m.clientes.crearCliente({ comercio: "Comercio del adelanto" });
    await m.clientes.actualizarCliente(clienteId, { vendedorId });

    const pedidoId = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 12 }] });
    await m.pedidos.cambiarEstado(pedidoId, "entregado");

    const saldo = async () => (await m.vendedores.liquidacion(RANGO)).find((l) => l.vendedor.id === vendedorId)!;
    expect((await saldo()).saldoCentavos).toBe(50000);

    await m.vendedores.registrarPagoComision({ vendedorId, montoCentavos: 80000, forma: "efectivo", fecha: HOY });
    expect((await saldo()).saldoCentavos).toBe(-30000);

    // Lo que venda después se descuenta contra el adelanto, no se suma encima.
    const otro = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 12 }] });
    await m.pedidos.cambiarEstado(otro, "entregado");
    expect((await saldo()).saldoCentavos).toBe(20000);
  });
});

/*
 * La comisión de un pedido puntual. Casi siempre es la fija del vendedor, pero
 * lo que se arregla distinto para una venta tiene que quedar escrito: dentro de
 * tres meses nadie se acuerda por qué ese pedido pagó otra cosa.
 */
describe("comisión elegida al cargar el pedido", () => {
  let vendedorId: string;
  let clienteId: string;

  beforeAll(async () => {
    vendedorId = await m.vendedores.crearVendedor({
      nombre: "Con comisiones varias",
      modalidad: "comisión",
      comisionPorBultoCentavos: 50000,
    });
    clienteId = await m.clientes.crearCliente({ comercio: "Comercio de las comisiones", vendedorId });
  });

  it("el comercio nace ya con su vendedor", async () => {
    expect((await m.clientes.obtenerCliente(clienteId))!.vendedorId).toBe(vendedorId);
  });

  it("sin pedir nada usa la fija y lo deja dicho", async () => {
    const id = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 120 }] });
    const pedido = (await m.pedidos.obtenerPedido(id))!;
    expect(pedido.comisionCentavos).toBe(500000);
    expect(pedido.comisionOrigen).toBe("fija");
    expect(pedido.comisionDetalle).toBe(`${formatearPesos(50000)} por bulto`);
  });

  it("acepta otro valor por bulto solo para ese pedido", async () => {
    const id = await m.pedidos.crearPedido({
      clienteId,
      fecha: HOY,
      comision: { origen: "extraordinaria", porBultoCentavos: 80000 },
      items: [{ productoId, cantidad: 120 }],
    });
    const pedido = (await m.pedidos.obtenerPedido(id))!;
    expect(pedido.comisionCentavos).toBe(800000);
    expect(pedido.comisionOrigen).toBe("extraordinaria");

    // Y la fija del vendedor sigue intacta: lo extraordinario no se contagia.
    expect((await m.vendedores.obtenerVendedor(vendedorId))!.comisionPorBultoCentavos).toBe(50000);
    const otro = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 12 }] });
    expect((await m.pedidos.obtenerPedido(otro))!.comisionCentavos).toBe(50000);
  });

  /*
   * Un monto cerrado no mira cuántos bultos son: es lo que se arregló. Si se
   * prorrateara como el valor por bulto, pedir un bulto más cambiaría un número
   * que ya estaba conversado.
   */
  it("un monto por todo el pedido no se prorratea", async () => {
    const id = await m.pedidos.crearPedido({
      clienteId,
      fecha: HOY,
      comision: { origen: "extraordinaria", totalCentavos: 1500000 },
      items: [{ productoId, cantidad: 24 }],
    });
    const pedido = (await m.pedidos.obtenerPedido(id))!;
    expect(pedido.comisionCentavos).toBe(1500000);
    expect(pedido.comisionDetalle).toBe("monto fijo por todo el pedido");
  });

  it("a un comercio sin vendedor no le cobra comisión ni aunque se la pidan", async () => {
    const suelto = await m.clientes.crearCliente({ comercio: "Comercio de la casa" });
    const id = await m.pedidos.crearPedido({
      clienteId: suelto,
      fecha: HOY,
      comision: { origen: "extraordinaria", totalCentavos: 999999 },
      items: [{ productoId, cantidad: 12 }],
    });
    const pedido = (await m.pedidos.obtenerPedido(id))!;
    expect(pedido.vendedorId).toBeNull();
    expect(pedido.comisionCentavos).toBe(0);
  });
});
