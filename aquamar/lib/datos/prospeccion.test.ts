import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { linkMapa, linkWhatsapp } from "../contacto";
import { hoy } from "../formato";
import { PAPELERAS_MATANZA } from "./papeleras-matanza";

/**
 * Prospección: el relevamiento de papeleras y el seguimiento de cada puerta.
 * Lo que se cuida acá es que reimportar no pise el trabajo del vendedor y que
 * el estado del embudo no pueda separarse de la nota que lo explica.
 */

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), "aquamar-prospeccion-"));
process.env.DATABASE_FILE = path.join(carpeta, "test.sqlite");

type Modulos = {
  prospeccion: typeof import("./prospeccion");
  clientes: typeof import("./clientes");
};

let m: Modulos;
const HOY = hoy();

beforeAll(async () => {
  m = {
    prospeccion: await import("./prospeccion"),
    clientes: await import("./clientes"),
  };
});

describe("relevamiento de papeleras", () => {
  it("carga todas las papeleras de la lista", async () => {
    const sumados = await m.prospeccion.sembrarRelevamiento();
    expect(sumados).toBe(PAPELERAS_MATANZA.length);

    const filas = await m.prospeccion.listarProspectos();
    expect(filas).toHaveLength(PAPELERAS_MATANZA.length);
  });

  it("no duplica al volver a importar", async () => {
    expect(await m.prospeccion.sembrarRelevamiento()).toBe(0);
    expect(await m.prospeccion.listarProspectos()).toHaveLength(PAPELERAS_MATANZA.length);
  });

  it("todas entran sin contactar y con el pin en el barrio", async () => {
    const filas = await m.prospeccion.listarProspectos();
    expect(filas.every((p) => p.estado === "sin contactar")).toBe(true);
    expect(filas.every((p) => p.precisionGeo === "localidad")).toBe(true);
    // Sin coordenadas no habría mapa: toda localidad relevada tiene centro.
    expect(filas.every((p) => p.lat !== null && p.lng !== null)).toBe(true);
  });

  it("entran sin verificar, porque son datos de directorio", async () => {
    const filas = await m.prospeccion.listarProspectos();
    expect(filas.every((p) => p.verificado === false)).toBe(true);
    expect(filas.every((p) => p.fuente !== "")).toBe(true);
  });

  /*
   * El caso que importa: alguien corrigió un teléfono a mano y después se suma
   * una papelera nueva a la lista. La corrección tiene que sobrevivir.
   */
  it("reimportar no pisa lo corregido a mano", async () => {
    const [primero] = await m.prospeccion.listarProspectos();
    await m.prospeccion.actualizarProspecto(primero.id, {
      telefono: "011 5555-0000",
      verificado: true,
    });

    await m.prospeccion.sembrarRelevamiento();

    const despues = await m.prospeccion.obtenerProspecto(primero.id);
    expect(despues?.telefono).toBe("011 5555-0000");
    expect(despues?.verificado).toBe(true);
  });
});

describe("seguimiento", () => {
  let id: string;

  beforeAll(async () => {
    id = await m.prospeccion.crearProspecto({
      comercio: "Papelera de prueba",
      localidad: "San Justo",
      direccion: "Falsa 123",
      telefono: "011 4000-0000",
    });
  });

  it("un prospecto nuevo cae en el centro de su localidad", async () => {
    const p = await m.prospeccion.obtenerProspecto(id);
    expect(p?.lat).toBeCloseTo(-34.6769, 3);
    expect(p?.precisionGeo).toBe("localidad");
  });

  it("registrar un contacto mueve el estado y deja historial", async () => {
    await m.prospeccion.registrarContacto({
      prospectoId: id,
      canal: "visita",
      estado: "interesado",
      detalle: "Pidió lista de precios",
      registradoPor: "Kevin A",
      proximaAccion: "Volver con la lista",
      proximaAccionFecha: HOY,
    });

    const p = await m.prospeccion.obtenerProspecto(id);
    expect(p?.estado).toBe("interesado");
    expect(p?.ultimoContactoEn).toBe(HOY);
    expect(p?.proximaAccion).toBe("Volver con la lista");
    // Haber hablado con el comercio confirma de paso los datos de contacto.
    expect(p?.verificado).toBe(true);

    const historial = await m.prospeccion.listarContactos(id);
    expect(historial).toHaveLength(1);
    expect(historial[0].detalle).toBe("Pidió lista de precios");
    expect(historial[0].estado).toBe("interesado");
  });

  it("el historial se acumula, no se reemplaza", async () => {
    await m.prospeccion.registrarContacto({
      prospectoId: id,
      canal: "whatsapp",
      estado: "cotizado",
      detalle: "Le pasé precios por WhatsApp",
    });

    const historial = await m.prospeccion.listarContactos(id);
    expect(historial).toHaveLength(2);
    expect((await m.prospeccion.obtenerProspecto(id))?.estado).toBe("cotizado");
  });

  it("no se puede anotar un contacto sobre un prospecto que no existe", async () => {
    await expect(
      m.prospeccion.registrarContacto({ prospectoId: "no-existe", canal: "visita", estado: "contactado" }),
    ).rejects.toThrow(m.prospeccion.ErrorProspecto);
  });

  it("geocodificar la dirección sube la precisión del pin", async () => {
    await m.prospeccion.guardarUbicacion(id, -34.6801, -58.5612);
    const p = await m.prospeccion.obtenerProspecto(id);
    expect(p?.precisionGeo).toBe("direccion");
    expect(p?.lat).toBeCloseTo(-34.6801, 4);
  });

  it("convertir en cliente crea la ficha y deja el puente", async () => {
    const clienteId = await m.prospeccion.convertirEnCliente(id);

    const cliente = await m.clientes.obtenerCliente(clienteId);
    expect(cliente?.comercio).toBe("Papelera de prueba");
    expect(cliente?.direccion).toBe("Falsa 123, San Justo");

    const p = await m.prospeccion.obtenerProspecto(id);
    expect(p?.clienteId).toBe(clienteId);
    // Sigue en el tablero: es la única forma de medir cuántos se convirtieron.
    expect(p?.estado).toBe("cliente");
  });

  it("no se convierte dos veces", async () => {
    await expect(m.prospeccion.convertirEnCliente(id)).rejects.toThrow(m.prospeccion.ErrorProspecto);
  });
});

describe("resumen del embudo", () => {
  it("cuenta lo abierto, lo ganado y lo vencido", async () => {
    const filas = await m.prospeccion.listarProspectos();
    const r = m.prospeccion.resumir(filas);

    expect(r.total).toBe(filas.length);
    expect(r.clientes).toBe(1);
    // El convertido ya no está en juego.
    expect(r.abiertos).toBe(r.total - r.clientes);
    expect(r.sinContactar).toBe(r.porEstado["sin contactar"]);
    expect(r.porLocalidad.reduce((a, l) => a + l.total, 0)).toBe(r.total);
  });

  it("una acción con fecha de hoy ya cuenta como vencida", async () => {
    const id = await m.prospeccion.crearProspecto({ comercio: "Pendiente", localidad: "Tapiales" });
    await m.prospeccion.registrarContacto({
      prospectoId: id,
      canal: "llamada",
      estado: "contactado",
      proximaAccion: "Pasar por el local",
      proximaAccionFecha: HOY,
    });

    const r = m.prospeccion.resumir(await m.prospeccion.listarProspectos());
    expect(r.vencidos).toBeGreaterThanOrEqual(1);
  });

  it("un prospecto descartado no cuenta como abierto ni como vencido", async () => {
    const id = await m.prospeccion.crearProspecto({ comercio: "Cerrado", localidad: "Tapiales" });
    await m.prospeccion.registrarContacto({
      prospectoId: id,
      canal: "visita",
      estado: "descartado",
      proximaAccion: "—",
      proximaAccionFecha: HOY,
    });

    const filas = await m.prospeccion.listarProspectos();
    const r = m.prospeccion.resumir(filas);
    expect(r.porEstado["descartado"]).toBe(1);
    expect(r.abiertos).toBe(filas.filter((p) => p.estado !== "cliente" && p.estado !== "descartado").length);
  });
});

describe("links de contacto", () => {
  // WhatsApp quiere el 9 de celular argentino después del 54: sin él, no abre.
  it("arma el link de un celular escrito a la argentina", () => {
    expect(linkWhatsapp("11 3290-7503")).toBe("https://wa.me/5491132907503");
  });

  it("saca el 0 de larga distancia y el 15 del celular", () => {
    expect(linkWhatsapp("011 15-6605-8150")).toBe("https://wa.me/5491166058150");
  });

  it("respeta un número que ya viene internacional", () => {
    expect(linkWhatsapp("+54 9 11 2586-4651")).toBe("https://wa.me/5491125864651");
  });

  it("le agrega el 9 a un internacional que no lo trae", () => {
    expect(linkWhatsapp("54 11 2586-4651")).toBe("https://wa.me/5491125864651");
  });

  it("no inventa un link con un número incompleto", () => {
    expect(linkWhatsapp("4486-00")).toBeNull();
    expect(linkWhatsapp("")).toBeNull();
  });

  it("el link al mapa lleva el comercio y la zona", () => {
    const url = linkMapa("Papelera Amichi", "Av. Don Bosco 2542", "Villa Luzuriaga");
    expect(url).toContain("google.com/maps");
    expect(decodeURIComponent(url)).toContain("Papelera Amichi, Av. Don Bosco 2542, Villa Luzuriaga");
  });
});
