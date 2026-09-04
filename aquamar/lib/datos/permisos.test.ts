import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Permisos, bitácora y exportación. Lo importante acá es que el depósito no
 * pueda ver ni tocar plata, ni siquiera sin querer.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-perm-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");
process.env.APP_SECRET = "secreto-de-prueba";
process.env.ADMIN_PASSWORD = "clave-admin";
process.env.DEPOSITO_PASSWORD = "clave-deposito";

type Modulos = {
  auth: typeof import("../auth");
  bitacora: typeof import("./bitacora");
  clientes: typeof import("./clientes");
  exportar: typeof import("./exportar");
  consultas: typeof import("./consultas");
  pedidos: typeof import("./pedidos");
  productos: typeof import("./productos");
};

let m: Modulos;

beforeAll(async () => {
  m = {
    auth: await import("../auth"),
    bitacora: await import("./bitacora"),
    clientes: await import("./clientes"),
    exportar: await import("./exportar"),
    consultas: await import("./consultas"),
    pedidos: await import("./pedidos"),
    productos: await import("./productos"),
  };
});

describe("claves y roles", () => {
  it("la clave de administración abre el rol completo", () => {
    expect(m.auth.rolDeClave("clave-admin")).toBe("admin");
  });

  it("la clave del depósito abre solo el depósito", () => {
    expect(m.auth.rolDeClave("clave-deposito")).toBe("deposito");
  });

  it("una clave que no es ninguna de las dos no abre nada", () => {
    expect(m.auth.rolDeClave("otra")).toBeNull();
    expect(m.auth.rolDeClave("")).toBeNull();
  });

  it("la cookie lleva el rol firmado y no se puede inventar uno", () => {
    const galleta = m.auth.galletaDeRol("deposito");
    expect(galleta.startsWith("deposito.")).toBe(true);
    // Cambiar el rol a mano rompe la firma.
    expect(galleta.replace("deposito", "admin")).not.toBe(m.auth.galletaDeRol("admin"));
  });

  it("cada rol tiene su propia firma", () => {
    expect(m.auth.galletaDeRol("admin")).not.toBe(m.auth.galletaDeRol("deposito"));
  });
});

describe("bitácora", () => {
  it("anota quién hizo qué", async () => {
    await m.bitacora.anotar({
      actor: "deposito",
      accion: "Ajuste de inventario",
      entidad: "producto",
      detalle: "-3 · Cajas rotas",
    });
    const [ultima] = await m.bitacora.listarBitacora();
    expect(ultima.actor).toBe("deposito");
    expect(ultima.detalle).toContain("Cajas rotas");
  });

  it("no tira abajo la operación si algo falla al anotar", async () => {
    // Sin actor ni acción igual no rompe: anotar nunca puede ser el motivo de
    // que se caiga un cobro o un movimiento de stock.
    await expect(m.bitacora.anotar({ actor: "", accion: "" })).resolves.toBeUndefined();
  });
});

describe("exportación", () => {
  beforeAll(async () => {
    const productoId = await m.productos.crearProducto({
      nombre: 'Powerful "3 en 1"; especial',
      stock: 10,
      costoCentavos: 400000,
      precioCentavos: 750000,
    });
    const clienteId = await m.clientes.crearCliente({ comercio: "Almacén; con punto y coma" });
    await m.pedidos.crearPedido({ clienteId, fecha: "2026-06-01", items: [{ productoId, cantidad: 2 }] });
  });

  it("escapa las comillas y los punto y coma para que Excel no parta la fila", async () => {
    const csv = await m.exportar.exportar("productos");
    const lineas = csv.trim().split("\n");
    expect(lineas).toHaveLength(2);
    expect(lineas[1]).toContain('"Powerful ""3 en 1""; especial"');
  });

  it("escribe los importes con coma decimal", async () => {
    const csv = await m.exportar.exportar("productos");
    expect(csv).toContain("4000,00");
    expect(csv).toContain("7500,00");
  });

  it("arranca con BOM para que no se rompan los acentos", async () => {
    expect((await m.exportar.exportar("clientes")).charCodeAt(0)).toBe(0xfeff);
  });

  it("exporta todas las tablas sin romperse", async () => {
    const respaldo = await m.exportar.respaldoCompleto();
    for (const clave of Object.keys(m.exportar.EXPORTABLES)) {
      expect(typeof respaldo[clave as keyof typeof respaldo]).toBe("string");
    }
  });

  it("cuenta lo que hay guardado", async () => {
    const inv = await m.exportar.inventarioDeDatos();
    expect(inv.productos).toBe(1);
    expect(inv.clientes).toBe(1);
    expect(inv.pedidos).toBe(1);
  });
});

describe("preguntas del negocio", () => {
  it("contesta todas con un número, no con un error", async () => {
    const respuestas = await m.consultas.responder({ desde: "2026-06-01", hasta: "2026-06-30" });
    expect(respuestas.length).toBeGreaterThanOrEqual(10);
    for (const r of respuestas) {
      expect(r.pregunta.length).toBeGreaterThan(0);
      expect(r.respuesta.length).toBeGreaterThan(0);
    }
  });

  it("no se cae en un período sin nada", async () => {
    const respuestas = await m.consultas.responder({ desde: "2019-01-01", hasta: "2019-01-31" });
    expect(respuestas.find((r) => r.clave === "ventas")!.valor).toBe(0);
    expect(respuestas.find((r) => r.clave === "producto")!.respuesta).toContain("Sin ventas");
  });

  it("cada pregunta tiene una clave distinta, para poder pedirla por nombre", async () => {
    const respuestas = await m.consultas.responder();
    expect(new Set(respuestas.map((r) => r.clave)).size).toBe(respuestas.length);
  });
});
