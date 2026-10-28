import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { hoy } from "../formato";

/**
 * El caso que motivó todo esto: la mercadería ya está contada en el depósito y
 * lo que falta es la factura. Registrarla no puede sumar una sola unidad, y las
 * mismas unidades no pueden quedar amparadas por dos facturas distintas.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-vinculadas-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  compras: typeof import("./compras");
  productos: typeof import("./productos");
  proveedores: typeof import("./proveedores");
  stock: typeof import("./stock");
};

let m: Modulos;
let proveedorId: string;

const HOY = hoy();

/** Un producto nuevo por prueba: así una no le mueve el stock a la otra. */
async function productoNuevo(nombre: string, stockInicial: number) {
  const id = await m.productos.crearProducto({
    nombre,
    presentacion: "Caja x 12",
    stock: 0,
    costoCentavos: 0,
    precioCentavos: 750000,
  });
  if (stockInicial > 0) {
    await m.stock.registrarEntrada({
      productoId: id,
      cantidad: stockInicial,
      motivo: "Stock inicial contado a mano",
      fecha: HOY,
    });
  }
  return id;
}

async function compraDe(
  productoId: string,
  cantidad: number,
  costoUnitNetoCentavos: number,
  modoIngreso: "nuevo" | "vinculado",
) {
  return m.compras.crearCompra({
    proveedorId,
    fecha: HOY,
    comprobante: "A 0001-00000001",
    modoIngreso,
    items: [{ productoId, cantidad, costoUnitNetoCentavos, ivaAlicuota: 2100 }],
  });
}

/** El único movimiento con unidades libres que tiene el producto recién creado. */
async function movimientoInicial(productoId: string) {
  const libres = await m.compras.movimientosVinculables(productoId);
  return libres[0];
}

beforeAll(async () => {
  m = {
    compras: await import("./compras"),
    productos: await import("./productos"),
    proveedores: await import("./proveedores"),
    stock: await import("./stock"),
  };
  proveedorId = await m.proveedores.crearProveedor({ nombre: "Powerful SA", cuit: "30-11111111-9" });
});

describe("repreciar sin mover el stock", () => {
  it("pone el costo de la factura si toda la mercadería es de esa compra", () => {
    expect(m.compras.promedioRepreciado(600, 0, 600, 450000)).toBe(450000);
  });

  it("repondera dentro del mismo total si la factura cubre una parte", () => {
    // 100 unidades: 60 pasan a valer 500 y 40 siguen valiendo 100.
    expect(m.compras.promedioRepreciado(100, 10000, 60, 50000)).toBe(34000);
  });

  it("no agranda el stock: el total sigue siendo el que había", () => {
    // La diferencia con el promedio ponderado, que sí sumaría unidades.
    expect(m.compras.promedioPonderado(100, 10000, 60, 50000)).toBe(25000);
    expect(m.compras.promedioRepreciado(100, 10000, 60, 50000)).toBe(34000);
  });

  it("toma el costo de la factura si desde el conteo ya salieron unidades", () => {
    expect(m.compras.promedioRepreciado(40, 10000, 60, 50000)).toBe(50000);
  });
});

describe("compra vinculada a stock que ya estaba contado", () => {
  it("registra la factura sin sumar una sola unidad al depósito", async () => {
    const productoId = await productoNuevo("Powerful 40 cápsulas", 600);
    const compraId = await compraDe(productoId, 600, 450000, "vinculado");
    const mov = await movimientoInicial(productoId);

    await m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 600 });
    await m.compras.confirmarCompra(compraId);

    const producto = await m.productos.obtenerProducto(productoId);
    expect(producto?.stock).toBe(600);
    expect(producto?.costoCentavos).toBe(450000);
    expect(producto?.ultimoCostoCentavos).toBe(450000);
  });

  it("no escribe ningún movimiento de depósito nuevo", async () => {
    const productoId = await productoNuevo("Powerful 20 cápsulas", 396);
    const antes = (await m.stock.listarMovimientos({ productoId })).length;

    const compraId = await compraDe(productoId, 396, 300000, "vinculado");
    const mov = await movimientoInicial(productoId);
    await m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 396 });
    await m.compras.confirmarCompra(compraId);

    expect((await m.stock.listarMovimientos({ productoId })).length).toBe(antes);
  });

  it("una compra de mercadería nueva sí suma, como siempre", async () => {
    const productoId = await productoNuevo("Powerful nuevo ingreso", 100);
    const compraId = await compraDe(productoId, 50, 450000, "nuevo");
    await m.compras.confirmarCompra(compraId);

    expect((await m.productos.obtenerProducto(productoId))?.stock).toBe(150);
  });
});

describe("las mismas unidades no se vinculan dos veces", () => {
  it("rechaza vincular más unidades de las que trajo el movimiento", async () => {
    const productoId = await productoNuevo("Powerful tope de movimiento", 100);
    const compraId = await compraDe(productoId, 120, 450000, "vinculado");
    const mov = await movimientoInicial(productoId);

    await expect(
      m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 120 }),
    ).rejects.toThrow(/quedan 100 unidades sin factura/);
  });

  it("no deja que dos facturas se cuelguen del mismo movimiento", async () => {
    const productoId = await productoNuevo("Powerful doble factura", 100);
    const primera = await compraDe(productoId, 100, 450000, "vinculado");
    const segunda = await compraDe(productoId, 100, 460000, "vinculado");
    const mov = await movimientoInicial(productoId);

    await m.compras.vincularMovimiento({ compraId: primera, movimientoId: mov.movimientoId, cantidad: 100 });

    await expect(
      m.compras.vincularMovimiento({ compraId: segunda, movimientoId: mov.movimientoId, cantidad: 100 }),
    ).rejects.toThrow(/ya están vinculadas a otra compra/);
  });

  it("permite repartir un movimiento grande entre dos facturas", async () => {
    const productoId = await productoNuevo("Powerful dos remitos", 100);
    const primera = await compraDe(productoId, 60, 450000, "vinculado");
    const segunda = await compraDe(productoId, 40, 460000, "vinculado");
    const mov = await movimientoInicial(productoId);

    await m.compras.vincularMovimiento({ compraId: primera, movimientoId: mov.movimientoId, cantidad: 60 });
    await m.compras.vincularMovimiento({ compraId: segunda, movimientoId: mov.movimientoId, cantidad: 40 });

    expect((await movimientoInicial(productoId)) ?? { libre: 0 }).toMatchObject({ libre: 0 });
  });

  it("no deja vincular más de lo que dice la factura", async () => {
    const productoId = await productoNuevo("Powerful tope de factura", 500);
    const compraId = await compraDe(productoId, 100, 450000, "vinculado");
    const mov = await movimientoInicial(productoId);

    await expect(
      m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 200 }),
    ).rejects.toThrow(/trae 100 unidades/);
  });

  it("no deja vincular un producto que no está en la factura", async () => {
    const conStock = await productoNuevo("Powerful ajeno", 100);
    const facturado = await productoNuevo("Powerful facturado", 0);
    const compraId = await compraDe(facturado, 10, 450000, "vinculado");
    const mov = await movimientoInicial(conStock);

    await expect(
      m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 10 }),
    ).rejects.toThrow(/no está en los renglones/);
  });

  it("no ofrece para vincular las unidades que entraron con una compra", async () => {
    const productoId = await productoNuevo("Powerful ya facturado", 0);
    const compraId = await compraDe(productoId, 50, 450000, "nuevo");
    await m.compras.confirmarCompra(compraId);

    expect(await m.compras.movimientosVinculables(productoId)).toEqual([]);
  });
});

describe("confirmar exige que la factura esté cubierta entera", () => {
  it("no confirma con renglones a medio vincular", async () => {
    const productoId = await productoNuevo("Powerful a medias", 100);
    const compraId = await compraDe(productoId, 100, 450000, "vinculado");
    const mov = await movimientoInicial(productoId);
    await m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 60 });

    await expect(m.compras.confirmarCompra(compraId)).rejects.toThrow(/trae 100 y están vinculadas 60/);
  });

  it("dice renglón por renglón cuánto falta", async () => {
    const productoId = await productoNuevo("Powerful pendiente", 100);
    const compraId = await compraDe(productoId, 100, 450000, "vinculado");
    const mov = await movimientoInicial(productoId);
    await m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 40 });

    expect(await m.compras.pendienteDeVincular(compraId)).toMatchObject([
      { pide: 100, vinculado: 40, falta: 60 },
    ]);
  });

  it("no deja tocar la vinculación de una compra ya confirmada", async () => {
    const productoId = await productoNuevo("Powerful cerrado", 100);
    const compraId = await compraDe(productoId, 100, 450000, "vinculado");
    const mov = await movimientoInicial(productoId);
    await m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 100 });
    await m.compras.confirmarCompra(compraId);

    const vinculos = await m.compras.vinculosDeCompra(compraId);
    await expect(m.compras.desvincularMovimiento(vinculos[0].id)).rejects.toThrow(/ya está confirmada/);
  });
});

describe("anular una compra vinculada", () => {
  it("no saca mercadería del depósito y libera las unidades", async () => {
    const productoId = await productoNuevo("Powerful anulada", 100);
    const compraId = await compraDe(productoId, 100, 450000, "vinculado");
    const mov = await movimientoInicial(productoId);
    await m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 100 });
    await m.compras.confirmarCompra(compraId);

    await m.compras.anularCompra(compraId, "La factura era de otro proveedor");

    expect((await m.productos.obtenerProducto(productoId))?.stock).toBe(100);
    expect(await m.compras.vinculosDeCompra(compraId)).toEqual([]);
    // Y las unidades quedan disponibles para la factura correcta.
    expect((await movimientoInicial(productoId)).libre).toBe(100);
  });
});

describe("corregir el depósito sin romper el historial", () => {
  it("deshace un movimiento escribiendo el contrario", async () => {
    const productoId = await productoNuevo("Powerful mal contado", 100);
    const mov = await movimientoInicial(productoId);

    await m.stock.revertirMovimiento({ movimientoId: mov.movimientoId, motivo: "Conté dos veces el mismo pallet" });

    expect((await m.productos.obtenerProducto(productoId))?.stock).toBe(0);
    const libro = await m.stock.listarMovimientos({ productoId });
    expect(libro).toHaveLength(2);
    expect(libro[0]).toMatchObject({ cantidad: -100, revierteA: mov.movimientoId });
  });

  it("no deja corregir dos veces el mismo movimiento", async () => {
    const productoId = await productoNuevo("Powerful doble corrección", 100);
    const mov = await movimientoInicial(productoId);
    await m.stock.revertirMovimiento({ movimientoId: mov.movimientoId, motivo: "Mal contado" });

    await expect(
      m.stock.revertirMovimiento({ movimientoId: mov.movimientoId, motivo: "De nuevo" }),
    ).rejects.toThrow(/ya fue corregido/);
  });

  it("manda a anular la compra en vez de tocar su movimiento", async () => {
    const productoId = await productoNuevo("Powerful de compra", 0);
    const compraId = await compraDe(productoId, 50, 450000, "nuevo");
    await m.compras.confirmarCompra(compraId);
    const mov = (await m.stock.listarMovimientos({ productoId }))[0];

    await expect(
      m.stock.revertirMovimiento({ movimientoId: mov.id, motivo: "Me equivoqué" }),
    ).rejects.toThrow(/anulá la compra/);
  });

  it("no deja corregir unidades que ya tienen factura", async () => {
    const productoId = await productoNuevo("Powerful con factura", 100);
    const compraId = await compraDe(productoId, 100, 450000, "vinculado");
    const mov = await movimientoInicial(productoId);
    await m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 100 });

    await expect(
      m.stock.revertirMovimiento({ movimientoId: mov.movimientoId, motivo: "Mal contado" }),
    ).rejects.toThrow(/vinculadas a una compra/);
  });

  it("exige un motivo", async () => {
    const productoId = await productoNuevo("Powerful sin motivo", 10);
    const mov = await movimientoInicial(productoId);
    await expect(
      m.stock.revertirMovimiento({ movimientoId: mov.movimientoId, motivo: "   " }),
    ).rejects.toThrow(/necesita un motivo/);
  });
});

describe("qué movimientos se pueden corregir desde la pantalla", () => {
  it("no ofrece corregir unidades que ya tienen factura", async () => {
    const productoId = await productoNuevo("Powerful ya amparado", 100);
    const compraId = await compraDe(productoId, 100, 450000, "vinculado");
    const mov = await movimientoInicial(productoId);
    await m.compras.vincularMovimiento({ compraId, movimientoId: mov.movimientoId, cantidad: 100 });

    const [fila] = await m.stock.listarMovimientos({ productoId });
    expect(fila.conFactura).toBe(true);
    expect(m.stock.sePuedeRevertir(fila)).toBe(false);
  });

  it("sí ofrece corregir una entrada cargada a mano y sin factura", async () => {
    const productoId = await productoNuevo("Powerful suelto", 100);
    const [fila] = await m.stock.listarMovimientos({ productoId });
    expect(m.stock.sePuedeRevertir(fila)).toBe(true);
  });

  it("no repite el renglón aunque el movimiento tenga varios vínculos", async () => {
    const productoId = await productoNuevo("Powerful dos vínculos", 100);
    const primera = await compraDe(productoId, 60, 450000, "vinculado");
    const segunda = await compraDe(productoId, 40, 460000, "vinculado");
    const mov = await movimientoInicial(productoId);
    await m.compras.vincularMovimiento({ compraId: primera, movimientoId: mov.movimientoId, cantidad: 60 });
    await m.compras.vincularMovimiento({ compraId: segunda, movimientoId: mov.movimientoId, cantidad: 40 });

    expect(await m.stock.listarMovimientos({ productoId })).toHaveLength(1);
  });
});
