import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { hoy } from "../formato";

/**
 * La cobertura que se le muestra a Powerful. Lo que importa es que no mienta:
 * ni de más —un comercio mal ubicado— ni de menos.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-mapa-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  clientes: typeof import("./clientes");
  mapa: typeof import("./mapa");
  pedidos: typeof import("./pedidos");
  productos: typeof import("./productos");
};

let m: Modulos;
let productoId: string;

const HOY = hoy();
const RANGO = { desde: `${HOY.slice(0, 7)}-01`, hasta: `${HOY.slice(0, 7)}-31` };
const de = (c: Awaited<ReturnType<Modulos["mapa"]["cobertura"]>>, nombre: string) =>
  c.localidades.find((l) => l.localidad === nombre)!;

beforeAll(async () => {
  m = {
    clientes: await import("./clientes"),
    mapa: await import("./mapa"),
    pedidos: await import("./pedidos"),
    productos: await import("./productos"),
  };
  productoId = await m.productos.crearProducto({
    nombre: "Powerful 3 en 1",
    stock: 5000,
    costoCentavos: 450000,
    precioCentavos: 750000,
  });
});

describe("cobertura del partido", () => {
  it("arranca con las 16 localidades en cero", async () => {
    const c = await m.mapa.cobertura(RANGO);
    expect(c.localidades).toHaveLength(16);
    expect(c.localidades.every((l) => l.comercios === 0)).toBe(true);
  });

  it("cuenta el comercio en su localidad", async () => {
    await m.clientes.crearCliente({ comercio: "Kiosco de San Justo", localidad: "San Justo" });
    const c = await m.mapa.cobertura(RANGO);
    expect(de(c, "San Justo").comercios).toBe(1);
    expect(de(c, "Ramos Mejía").comercios).toBe(0);
  });

  /*
   * Un comercio que compró en julio y no en agosto sigue siendo cobertura: la
   * pregunta que contesta el mapa es dónde estamos, no quién compró este mes.
   */
  it("el comercio cuenta aunque no haya comprado en el período", async () => {
    const c = await m.mapa.cobertura(RANGO);
    expect(de(c, "San Justo").comercios).toBe(1);
    expect(de(c, "San Justo").activos).toBe(0);
    expect(de(c, "San Justo").ventasCentavos).toBe(0);
  });

  it("suma lo entregado en el período a su localidad", async () => {
    const clienteId = await m.clientes.crearCliente({ comercio: "Almacén Catán", localidad: "González Catán" });
    const pedidoId = await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 120 }] });
    await m.pedidos.cambiarEstado(pedidoId, "entregado");

    const c = await m.mapa.cobertura(RANGO);
    const catan = de(c, "González Catán");
    expect(catan.comercios).toBe(1);
    expect(catan.activos).toBe(1);
    expect(catan.unidades).toBe(120);
    expect(catan.ventasCentavos).toBe(120 * 750000);
    expect(catan.cordon).toBe("tercero");
  });

  it("no cuenta un pedido que todavía no se entregó", async () => {
    const clienteId = await m.clientes.crearCliente({ comercio: "Pendiente", localidad: "Tapiales" });
    await m.pedidos.crearPedido({ clienteId, fecha: HOY, items: [{ productoId, cantidad: 12 }] });

    const c = await m.mapa.cobertura(RANGO);
    expect(de(c, "Tapiales").comercios).toBe(1);
    expect(de(c, "Tapiales").unidades).toBe(0);
  });

  it("los comercios sin localidad quedan aparte, no repartidos", async () => {
    await m.clientes.crearCliente({ comercio: "Sin ubicar", direccion: "Calle falsa 123" });
    const c = await m.mapa.cobertura(RANGO);
    expect(c.sinUbicar).toBe(1);
    expect(c.deducibles).toBe(0);
    expect(c.localidades.reduce((a, l) => a + l.comercios, 0)).toBe(3);
  });
});

describe("ubicar por la dirección", () => {
  it("ubica solo a los que nombran una localidad del partido", async () => {
    await m.clientes.crearCliente({ comercio: "Con dirección", direccion: "Av. Rivadavia 100, Ramos Mejía" });
    await m.clientes.crearCliente({ comercio: "Fuera del partido", direccion: "Av. Mitre 500, Avellaneda" });

    const antes = await m.mapa.cobertura(RANGO);
    expect(antes.sinUbicar).toBe(3);
    expect(antes.deducibles).toBe(1);

    const hecho = await m.mapa.ubicarPorDireccion();
    expect(hecho.ubicados).toBe(1);

    const despues = await m.mapa.cobertura(RANGO);
    expect(de(despues, "Ramos Mejía").comercios).toBe(1);
    expect(despues.sinUbicar).toBe(2);
  });

  it("no pisa una localidad ya cargada a mano", async () => {
    const clienteId = await m.clientes.crearCliente({
      comercio: "Cargado a mano",
      // La dirección dice una cosa y la localidad otra: manda la que se eligió.
      direccion: "Depósito en Tapiales, entrega en Aldo Bonzi",
      localidad: "Aldo Bonzi",
    });
    await m.mapa.ubicarPorDireccion();
    expect((await m.clientes.obtenerCliente(clienteId))!.localidad).toBe("Aldo Bonzi");
  });

  it("correrlo dos veces no cambia nada", async () => {
    const otra = await m.mapa.ubicarPorDireccion();
    expect(otra.ubicados).toBe(0);
  });
});

/*
 * El mapa real. Lo que se prueba acá es dónde cae cada comercio, no el dibujo:
 * un pin en la cuadra equivocada es peor que uno aproximado que se anuncia como
 * tal, sobre todo si el mapa se le muestra a la fábrica.
 */
describe("puntos sobre el mapa", () => {
  it("sin coordenadas propias cae en el centro de su localidad, y lo dice", async () => {
    const c = await m.mapa.cobertura(RANGO);
    const catan = de(c, "González Catán");
    const punto = catan.puntos[0];
    expect(punto.exacto).toBe(false);
    expect(punto.lat).toBeCloseTo(-34.7722, 3);
    expect(punto.lon).toBeCloseTo(-58.6417, 3);
  });

  /*
   * Tres comercios sin dirección exacta en la misma localidad no pueden quedar
   * apilados en el mismo punto: se ve un pin solo y los otros no se tocan.
   */
  it("separa los que comparten el centro de la localidad", async () => {
    for (const n of ["Uno de Ramos", "Otro de Ramos", "Tercero de Ramos"]) {
      await m.clientes.crearCliente({ comercio: n, localidad: "Ramos Mejía" });
    }
    const c = await m.mapa.cobertura(RANGO);
    // Los tres recién cargados más el que ya estaba ubicado por su dirección.
    const puntos = de(c, "Ramos Mejía").puntos;
    expect(puntos).toHaveLength(4);

    for (let i = 0; i < puntos.length; i++) {
      for (let j = i + 1; j < puntos.length; j++) {
        const d = Math.hypot(puntos[i].lat - puntos[j].lat, puntos[i].lon - puntos[j].lon);
        expect(d).toBeGreaterThan(0.002);
      }
      // Y ninguno se va de la localidad: el desvío es de cientos de metros.
      expect(Math.abs(puntos[i].lat - -34.6432)).toBeLessThan(0.01);
    }
  });

  it("con coordenadas propias usa las suyas y queda marcado como exacto", async () => {
    const clienteId = await m.clientes.crearCliente({ comercio: "Con esquina", localidad: "San Justo" });
    await m.clientes.actualizarCliente(clienteId, { lat: -34.6801, lon: -58.5623 });

    const c = await m.mapa.cobertura(RANGO);
    const punto = de(c, "San Justo").puntos.find((p) => p.id === clienteId)!;
    expect(punto.exacto).toBe(true);
    expect(punto.lat).toBe(-34.6801);
  });

  /*
   * "Rivadavia 1234" existe en media Argentina. Una dirección que resuelve
   * fuera del partido no se guarda: el pin quedaría en otra provincia.
   */
  it("descarta lo que cae fuera del partido", () => {
    expect(m.mapa.dentroDelPartido(-34.6767, -58.5601)).toBe(true); // San Justo
    expect(m.mapa.dentroDelPartido(-34.6037, -58.3816)).toBe(false); // Obelisco
    expect(m.mapa.dentroDelPartido(-31.4201, -64.1888)).toBe(false); // Córdoba
  });

  it("propone comercios con dirección y sin coordenadas, uno por vez", async () => {
    const proximo = await m.mapa.proximoSinCoordenadas();
    expect(proximo).not.toBeNull();
    // El que ya tiene coordenadas no vuelve a aparecer.
    expect(proximo!.comercio).not.toBe("Con esquina");
  });
});
