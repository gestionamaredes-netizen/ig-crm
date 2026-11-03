import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { hoy } from "../formato";

/**
 * El circuito del mayorista que paga por adelantado: deja la plata, se le
 * compra al proveedor, y recién después se le entrega.
 *
 * Lo que no puede pasar nunca: que el mismo billete entre dos veces a la caja.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-anticipos-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  anticipos: typeof import("./anticipos");
  caja: typeof import("./caja");
  clientes: typeof import("./clientes");
  pedidos: typeof import("./pedidos");
  productos: typeof import("./productos");
};

let m: Modulos;
let clienteId: string;
let otroClienteId: string;
let productoId: string;

const HOY = hoy();
const RANGO = { desde: `${HOY.slice(0, 7)}-01`, hasta: `${HOY.slice(0, 7)}-31` };

/** Un pedido de 10 unidades a 7.500: 75.000 pesos. */
async function pedidoDe(cliente = clienteId, cantidad = 10) {
  return m.pedidos.crearPedido({ clienteId: cliente, fecha: HOY, items: [{ productoId, cantidad }] });
}

beforeAll(async () => {
  m = {
    anticipos: await import("./anticipos"),
    caja: await import("./caja"),
    clientes: await import("./clientes"),
    pedidos: await import("./pedidos"),
    productos: await import("./productos"),
  };
  clienteId = await m.clientes.crearCliente({ comercio: "Mayorista del Oeste" });
  otroClienteId = await m.clientes.crearCliente({ comercio: "Kiosco de la esquina" });
  productoId = await m.productos.crearProducto({
    nombre: "Powerful 3 en 1",
    presentacion: "Caja x 12",
    stock: 5000,
    costoCentavos: 450000,
    precioCentavos: 750000,
  });
});

describe("recibir un anticipo", () => {
  it("entra la plata a la caja el día que la dejan", async () => {
    const antes = (await m.caja.saldos()).total;
    await m.anticipos.registrarAnticipo({
      clienteId,
      montoCentavos: 6000000,
      forma: "transferencia",
      fecha: HOY,
    });
    expect((await m.caja.saldos()).total).toBe(antes + 6000000);
  });

  it("cae en la caja que corresponde a la forma de pago", async () => {
    const antes = await m.caja.saldos();
    await m.anticipos.registrarAnticipo({ clienteId, montoCentavos: 500000, forma: "efectivo", fecha: HOY });
    const despues = await m.caja.saldos();
    expect(despues.efectivo).toBe(antes.efectivo + 500000);
    expect(despues.banco).toBe(antes.banco);
  });

  it("queda entero disponible hasta que se aplique", async () => {
    const saldo = await m.anticipos.saldoDeAnticipos(clienteId);
    expect(saldo.recibidoCentavos).toBe(6500000);
    expect(saldo.aplicadoCentavos).toBe(0);
    expect(saldo.disponibleCentavos).toBe(saldo.recibidoCentavos);
  });

  it("no acepta un importe en cero ni negativo", async () => {
    await expect(
      m.anticipos.registrarAnticipo({ clienteId, montoCentavos: 0, forma: "efectivo", fecha: HOY }),
    ).rejects.toThrow(/mayor a cero/);
  });
});

describe("aplicar el anticipo a la venta", () => {
  /** Un anticipo propio de cada prueba, para no depender del orden. */
  async function anticipoDe(cliente: string, monto: number) {
    return m.anticipos.registrarAnticipo({ clienteId: cliente, montoCentavos: monto, forma: "transferencia", fecha: HOY });
  }

  it("da el pedido por cobrado sin que entre un peso más a la caja", async () => {
    const anticipoId = await anticipoDe(clienteId, 7500000);
    const pedidoId = await pedidoDe(clienteId, 10); // 10 × 750.000 = 7.500.000
    const cajaAntes = (await m.caja.saldos()).total;

    await m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 7500000 });

    // Esto es todo el punto: el pedido queda cobrado y la caja no se movió.
    const pedido = (await m.pedidos.listarPedidos({ clienteId })).find((p) => p.id === pedidoId)!;
    expect(pedido.cobradoCentavos).toBe(7500000);
    expect(m.pedidos.estadoCobro(pedido)).toBe("cobrado");
    expect((await m.caja.saldos()).total).toBe(cajaAntes);
  });

  it("descuenta lo aplicado de lo disponible", async () => {
    const anticipoId = await anticipoDe(clienteId, 2000000);
    const pedidoId = await pedidoDe(clienteId, 1); // 750.000
    await m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 750000 });

    const a = (await m.anticipos.listarAnticipos({ clienteId })).find((x) => x.id === anticipoId)!;
    expect(a.aplicadoCentavos).toBe(750000);
    expect(a.disponibleCentavos).toBe(1250000);
  });

  it("no deja aplicar más de lo que queda en el anticipo", async () => {
    const anticipoId = await anticipoDe(clienteId, 500000);
    const pedidoId = await pedidoDe(clienteId, 10);
    await expect(
      m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 500001 }),
    ).rejects.toThrow(/quedan .* sin usar/);
  });

  it("no deja aplicar dos veces la misma plata", async () => {
    const anticipoId = await anticipoDe(clienteId, 750000);
    const uno = await pedidoDe(clienteId, 1);
    const dos = await pedidoDe(clienteId, 1);
    await m.anticipos.aplicarAnticipo({ anticipoId, pedidoId: uno, montoCentavos: 750000 });

    await expect(
      m.anticipos.aplicarAnticipo({ anticipoId, pedidoId: dos, montoCentavos: 750000 }),
    ).rejects.toThrow(/ya está aplicado por completo/);
  });

  it("no deja aplicar más de lo que el pedido debe", async () => {
    const anticipoId = await anticipoDe(clienteId, 2000000);
    const pedidoId = await pedidoDe(clienteId, 1); // 750.000
    await expect(
      m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 800000 }),
    ).rejects.toThrow(/le faltan .* por cobrar/);
  });

  it("no deja usar el anticipo de un comercio para el pedido de otro", async () => {
    const anticipoId = await anticipoDe(clienteId, 1000000);
    const ajeno = await pedidoDe(otroClienteId, 1);
    await expect(
      m.anticipos.aplicarAnticipo({ anticipoId, pedidoId: ajeno, montoCentavos: 100000 }),
    ).rejects.toThrow(/es de otro comercio/);
  });

  it("un anticipo grande puede cubrir varios pedidos", async () => {
    const grande = await m.anticipos.registrarAnticipo({
      clienteId: otroClienteId,
      montoCentavos: 3000000,
      forma: "transferencia",
      fecha: HOY,
    });
    const uno = await pedidoDe(otroClienteId, 1);
    const dos = await pedidoDe(otroClienteId, 2);

    await m.anticipos.aplicarAnticipo({ anticipoId: grande, pedidoId: uno, montoCentavos: 750000 });
    await m.anticipos.aplicarAnticipo({ anticipoId: grande, pedidoId: dos, montoCentavos: 1500000 });

    const [a] = (await m.anticipos.listarAnticipos({ clienteId: otroClienteId })).filter((x) => x.id === grande);
    expect(a.aplicadoCentavos).toBe(2250000);
    expect(a.disponibleCentavos).toBe(750000);
  });
});

describe("soltar y deshacer", () => {
  it("soltar una aplicación devuelve el pedido a deber y libera la plata", async () => {
    const anticipoId = await m.anticipos.registrarAnticipo({
      clienteId,
      montoCentavos: 1000000,
      forma: "efectivo",
      fecha: HOY,
    });
    const pedidoId = await pedidoDe(clienteId, 1);
    await m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 750000 });

    const [aplicacion] = await m.anticipos.aplicacionesDePedido(pedidoId);
    await m.anticipos.soltarAplicacion(aplicacion.id);

    const pedido = (await m.pedidos.listarPedidos({ clienteId })).find((p) => p.id === pedidoId)!;
    expect(pedido.cobradoCentavos).toBe(0);
    const a = (await m.anticipos.listarAnticipos({ clienteId })).find((x) => x.id === anticipoId)!;
    expect(a.disponibleCentavos).toBe(1000000);
  });

  it("no deja borrar un anticipo que ya se usó", async () => {
    const anticipoId = await m.anticipos.registrarAnticipo({
      clienteId,
      montoCentavos: 900000,
      forma: "efectivo",
      fecha: HOY,
    });
    const pedidoId = await pedidoDe(clienteId, 1);
    await m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 750000 });

    await expect(m.anticipos.eliminarAnticipo(anticipoId)).rejects.toThrow(/ya tiene .* aplicados/);
  });

  it("borrar un anticipo sin usar devuelve la plata por donde entró", async () => {
    const antes = await m.caja.saldos();
    const anticipoId = await m.anticipos.registrarAnticipo({
      clienteId,
      montoCentavos: 400000,
      forma: "efectivo",
      fecha: HOY,
    });
    await m.anticipos.eliminarAnticipo(anticipoId);
    expect((await m.caja.saldos()).efectivo).toBe(antes.efectivo);
  });

  it("borrar el pedido libera el anticipo en vez de dejarlo colgado", async () => {
    const anticipoId = await m.anticipos.registrarAnticipo({
      clienteId,
      montoCentavos: 800000,
      forma: "transferencia",
      fecha: HOY,
    });
    const pedidoId = await pedidoDe(clienteId, 1);
    await m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 750000 });

    const cajaAntes = (await m.caja.saldos()).total;
    await m.pedidos.eliminarPedido(pedidoId);

    // La plata del anticipo no se devuelve: el comercio la sigue teniendo a
    // favor. Lo que se suelta es a qué pedido estaba imputada.
    expect((await m.caja.saldos()).total).toBe(cajaAntes);
    const a = (await m.anticipos.listarAnticipos({ clienteId })).find((x) => x.id === anticipoId)!;
    expect(a.disponibleCentavos).toBe(800000);
  });
});

describe("qué pagaron y todavía no recibieron", () => {
  it("lista los pedidos cobrados que siguen sin entregar", async () => {
    const anticipoId = await m.anticipos.registrarAnticipo({
      clienteId,
      montoCentavos: 1500000,
      forma: "transferencia",
      fecha: HOY,
    });
    const pedidoId = await pedidoDe(clienteId, 2); // 1.500.000
    await m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 1500000 });

    const lista = await m.anticipos.pagadosSinEntregar();
    expect(lista.some((p) => p.id === pedidoId)).toBe(true);
  });

  it("lo saca de la lista cuando se entrega", async () => {
    const anticipoId = await m.anticipos.registrarAnticipo({
      clienteId,
      montoCentavos: 1500000,
      forma: "transferencia",
      fecha: HOY,
    });
    const pedidoId = await pedidoDe(clienteId, 2);
    await m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 1500000 });
    await m.pedidos.cambiarEstado(pedidoId, "entregado");

    expect((await m.anticipos.pagadosSinEntregar()).some((p) => p.id === pedidoId)).toBe(false);
  });

  it("no lista un pedido cobrado a medias", async () => {
    const anticipoId = await m.anticipos.registrarAnticipo({
      clienteId,
      montoCentavos: 1000000,
      forma: "efectivo",
      fecha: HOY,
    });
    const pedidoId = await pedidoDe(clienteId, 3); // 2.250.000
    await m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 1000000 });

    expect((await m.anticipos.pagadosSinEntregar()).some((p) => p.id === pedidoId)).toBe(false);
  });
});

describe("el circuito completo del mayorista", () => {
  it("la plata entra una sola vez, de punta a punta", async () => {
    const cliente = await m.clientes.crearCliente({ comercio: "Mati Titán" });
    const cajaAlEmpezar = (await m.caja.saldos()).total;

    // 1. Paga 6.000.000 por adelantado.
    const anticipoId = await m.anticipos.registrarAnticipo({
      clienteId: cliente,
      montoCentavos: 6000000,
      forma: "transferencia",
      fecha: HOY,
    });
    expect((await m.caja.saldos()).total).toBe(cajaAlEmpezar + 6000000);

    // 2. Se carga su pedido por ese importe (8 unidades a 750.000).
    const pedidoId = await m.pedidos.crearPedido({
      clienteId: cliente,
      fecha: HOY,
      items: [{ productoId, cantidad: 8 }],
    });

    // 3. Se aplica el anticipo y se entrega.
    await m.anticipos.aplicarAnticipo({ anticipoId, pedidoId, montoCentavos: 6000000 });
    await m.pedidos.cambiarEstado(pedidoId, "entregado");

    // La caja subió 6.000.000 y nada más: una sola vez.
    expect((await m.caja.saldos()).total).toBe(cajaAlEmpezar + 6000000);

    // Y en el flujo del período tampoco figura dos veces.
    const f = await m.caja.flujo(RANGO);
    const cobrosDelPedido = (await m.pedidos.cobrosDePedido(pedidoId)).length;
    expect(cobrosDelPedido).toBe(0);
    expect(f.ingresosCentavos).toBeGreaterThan(0);

    // Ya no debe nada y no está en la lista de pagados sin entregar.
    const pedido = (await m.pedidos.listarPedidos({ clienteId: cliente }))[0];
    expect(m.pedidos.saldoPedido(pedido)).toBe(0);
    expect((await m.anticipos.pagadosSinEntregar()).some((p) => p.id === pedidoId)).toBe(false);
    expect((await m.anticipos.saldoDeAnticipos(cliente)).disponibleCentavos).toBe(0);
  });
});
