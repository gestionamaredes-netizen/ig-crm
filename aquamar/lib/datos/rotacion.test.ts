import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

/** Ritmo de venta, cobertura del depósito y el estimador de impuestos. */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-rot-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  clientes: typeof import("./clientes");
  compras: typeof import("./compras");
  config: typeof import("./config");
  impuestos: typeof import("./impuestos");
  pedidos: typeof import("./pedidos");
  productos: typeof import("./productos");
  proveedores: typeof import("./proveedores");
  reportes: typeof import("./reportes");
  rotacion: typeof import("./rotacion");
};

let m: Modulos;
let rapido: string;
let quieto: string;
let clienteId: string;

// Fechas fijas: el ritmo de venta depende de la ventana, así que el test no
// puede quedar a merced del día en que se corra.
const HASTA = "2026-06-30";
const RANGO = { desde: "2026-06-01", hasta: HASTA };

beforeAll(async () => {
  m = {
    clientes: await import("./clientes"),
    compras: await import("./compras"),
    config: await import("./config"),
    impuestos: await import("./impuestos"),
    pedidos: await import("./pedidos"),
    productos: await import("./productos"),
    proveedores: await import("./proveedores"),
    reportes: await import("./reportes"),
    rotacion: await import("./rotacion"),
  };

  rapido = await m.productos.crearProducto({
    nombre: "Powerful 3 en 1", stock: 120, costoCentavos: 400000, precioCentavos: 750000,
  });
  quieto = await m.productos.crearProducto({
    nombre: "Powerful Aromas", stock: 80, costoCentavos: 300000, precioCentavos: 600000,
  });
  clienteId = await m.clientes.crearCliente({ comercio: "Almacén La Esquina" });

  // 120 unidades entregadas dentro de la ventana de 60 días -> 2 por día.
  const p = await m.pedidos.crearPedido({
    clienteId, fecha: "2026-06-15", items: [{ productoId: rapido, cantidad: 120 }],
  });
  await m.pedidos.cambiarEstado(p, "entregado");
  // Reponemos para que quede stock que medir.
  const { registrarEntrada } = await import("./stock");
  await registrarEntrada({ productoId: rapido, cantidad: 120, motivo: "Reposición", fecha: "2026-06-16" });
});

describe("rotación", () => {
  it("calcula el ritmo de venta sobre la ventana mirada", async () => {
    const l = (await m.rotacion.rotacion({ ventanaDias: 60, hasta: HASTA })).find((x) => x.id === rapido)!;
    expect(l.vendidoEnVentana).toBe(120);
    expect(l.ventaDiaria).toBe(2);
    expect(l.ventaSemanal).toBe(14);
  });

  it("dice cuántos días aguanta el depósito", async () => {
    const l = (await m.rotacion.rotacion({ ventanaDias: 60, hasta: HASTA })).find((x) => x.id === rapido)!;
    expect(l.libre).toBe(120);
    expect(l.diasDeStock).toBe(60); // 120 libres a 2 por día
  });

  it("no inventa un ritmo para lo que no se vendió", async () => {
    const l = (await m.rotacion.rotacion({ ventanaDias: 60, hasta: HASTA })).find((x) => x.id === quieto)!;
    expect(l.diasDeStock).toBeNull();
    expect(l.sinMovimiento).toBe(true);
    expect(l.sugerenciaCompra).toBe(0);
  });

  it("sugiere comprar lo que falta para cubrir los días objetivo", async () => {
    await m.config.guardarNumero("diasDeCobertura", 90);
    const l = (await m.rotacion.rotacion({ ventanaDias: 60, hasta: HASTA })).find((x) => x.id === rapido)!;
    // 90 días a 2 por día son 180; hay 120 libres, faltan 60.
    expect(l.sugerenciaCompra).toBe(60);

    await m.config.guardarNumero("diasDeCobertura", 30);
    const corto = (await m.rotacion.rotacion({ ventanaDias: 60, hasta: HASTA })).find((x) => x.id === rapido)!;
    expect(corto.sugerenciaCompra).toBe(0); // ya está cubierto
  });

  it("pone primero lo que se está por acabar", async () => {
    const lineas = await m.rotacion.rotacion({ ventanaDias: 60, hasta: HASTA });
    expect(lineas[0].id).toBe(rapido);
    expect(lineas[lineas.length - 1].id).toBe(quieto);
  });

  it("lista lo que hay que reponer", async () => {
    await m.config.guardarNumero("diasDeCobertura", 90);
    expect((await m.rotacion.aReponer({ ventanaDias: 60, hasta: HASTA })).some((l) => l.id === rapido)).toBe(true);
    await m.config.guardarNumero("diasDeCobertura", 30);
  });
});

describe("baja rotación", () => {
  it("marca el capital quieto en productos que no se movieron", async () => {
    const lista = await m.reportes.bajaRotacion(RANGO);
    const linea = lista.find((l) => l.id === quieto)!;
    expect(linea.unidadesVendidas).toBe(0);
    expect(linea.capitalQuietoCentavos).toBe(80 * 300000);
    expect(lista.some((l) => l.id === rapido)).toBe(false);
  });
});

describe("indicadores del período", () => {
  it("saca ticket promedio y margen por unidad del mismo resumen", async () => {
    const r = await m.reportes.resumen(RANGO);
    const i = m.reportes.indicadores(r);
    expect(r.pedidosEntregados).toBe(1);
    expect(i.ticketPromedioCentavos).toBe(r.ingresosCentavos);
    expect(i.margenPorUnidadCentavos).toBe(Math.round((r.ingresosCentavos - r.costoCentavos) / r.unidades));
  });

  it("no divide por cero en un período sin entregas", async () => {
    const r = await m.reportes.resumen({ desde: "2020-01-01", hasta: "2020-01-31" });
    const i = m.reportes.indicadores(r);
    expect(i.ticketPromedioCentavos).toBe(0);
    expect(i.margenPorUnidadCentavos).toBe(0);
  });
});

describe("estimador de impuestos", () => {
  beforeAll(async () => {
    const proveedorId = await m.proveedores.crearProveedor({ nombre: "Powerful SA" });
    const compra = await m.compras.crearCompra({
      proveedorId, fecha: "2026-06-10", comprobante: "A 0001-1",
      percepcionesCentavos: 500000,
      items: [{ productoId: rapido, cantidad: 100, costoUnitNetoCentavos: 400000, ivaAlicuota: 2100 }],
    });
    await m.compras.confirmarCompra(compra);
  });

  it("saca el IVA de adentro del precio cuando ya lo tiene incluido", async () => {
    await m.config.guardarPreciosConIva(true);
    const e = await m.impuestos.estimar(RANGO);
    // 120 a 7.500 = 900.000 finales -> neto 743.801,65 aprox
    expect(e.ventaBrutaCentavos).toBe(90000000);
    expect(e.ventaNetaCentavos).toBe(Math.round(90000000 / 1.21));
    expect(e.ivaDebitoCentavos).toBe(90000000 - Math.round(90000000 / 1.21));
  });

  it("lo calcula por encima del neto si los precios van sin IVA", async () => {
    await m.config.guardarPreciosConIva(false);
    const e = await m.impuestos.estimar(RANGO);
    expect(e.ventaNetaCentavos).toBe(90000000);
    expect(e.ivaDebitoCentavos).toBe(Math.round(90000000 * 0.21));
    await m.config.guardarPreciosConIva(true);
  });

  it("descuenta el IVA de las compras y las percepciones sufridas", async () => {
    const e = await m.impuestos.estimar(RANGO);
    expect(e.ivaCreditoCentavos).toBe(Math.round(100 * 400000 * 0.21));
    expect(e.percepcionesCentavos).toBe(500000);
    expect(e.saldoIvaCentavos).toBe(
      Math.max(0, e.ivaDebitoCentavos - e.ivaCreditoCentavos - e.percepcionesCentavos),
    );
  });

  it("suma Ingresos Brutos solo si se configuró una alícuota", async () => {
    expect((await m.impuestos.estimar(RANGO)).iibbCentavos).toBe(0);

    await m.config.guardarNumero("alicuotaIIBB", 350); // 3,5%
    const e = await m.impuestos.estimar(RANGO);
    expect(e.iibbCentavos).toBe(Math.round((e.ventaNetaCentavos * 350) / 10000));
    expect(e.reservaSugeridaCentavos).toBe(e.saldoIvaCentavos + e.iibbCentavos);
    await m.config.guardarNumero("alicuotaIIBB", 0);
  });

  it("no liquida IVA para un monotributista", async () => {
    await m.config.guardarRegimen("monotributo");
    const e = await m.impuestos.estimar(RANGO);
    expect(e.aplica).toBe(false);
    expect(e.ivaDebitoCentavos).toBe(0);
    expect(e.saldoIvaCentavos).toBe(0);
    await m.config.guardarRegimen("responsable_inscripto");
  });
});
