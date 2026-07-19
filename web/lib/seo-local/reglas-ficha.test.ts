import { describe, it, expect } from "vitest";
import { auditarFicha, PUNTOS_FICHA } from "@/lib/seo-local/reglas-ficha";
import type { FichaNegocio } from "@/lib/seo-local/tipos";

/** Ficha impecable: no debería disparar ningún hallazgo del bloque. */
const fichaPerfecta: FichaNegocio = {
  idExterno: "places/perfecta",
  nombre: "Panadería Modelo",
  rubro: "bakery",
  direccion: "Gorriti 1200, Francisco Álvarez",
  ubicacion: { lat: -34.605, lng: -58.865 },
  telefono: "+54 237 400-0000",
  sitioWeb: "https://panaderiamodelo.com.ar",
  diasConHorario: 7,
  puntaje: 4.7,
  cantidadResenas: 120,
  fechaResenaMasReciente: "2026-07-01T00:00:00.000Z",
  cantidadFotos: 12,
  estadoOperativo: "abierto",
};

const con = (cambios: Partial<FichaNegocio>): FichaNegocio => ({ ...fichaPerfecta, ...cambios });

describe("auditarFicha", () => {
  it("no encuentra nada en una ficha completa", () => {
    expect(auditarFicha(fichaPerfecta)).toEqual([]);
  });

  it("detecta la falta de teléfono y descuenta 8", () => {
    const [h] = auditarFicha(con({ telefono: null }));
    expect(h.codigo).toBe("ficha_sin_telefono");
    expect(h.puntosPerdidos).toBe(8);
    expect(h.bloque).toBe("ficha");
  });

  it("trata el teléfono vacío igual que el ausente", () => {
    expect(auditarFicha(con({ telefono: "   " }))[0].codigo).toBe("ficha_sin_telefono");
  });

  it("detecta la falta de sitio web y descuenta 8", () => {
    const [h] = auditarFicha(con({ sitioWeb: null }));
    expect(h.codigo).toBe("ficha_sin_web");
    expect(h.puntosPerdidos).toBe(8);
  });

  it("detecta horarios incompletos y descuenta 8", () => {
    const [h] = auditarFicha(con({ diasConHorario: 5 }));
    expect(h.codigo).toBe("ficha_horarios_incompletos");
    expect(h.puntosPerdidos).toBe(8);
  });

  it("detecta la falta de rubro y descuenta 6", () => {
    const [h] = auditarFicha(con({ rubro: null }));
    expect(h.codigo).toBe("ficha_sin_rubro");
    expect(h.puntosPerdidos).toBe(6);
  });

  it("detecta menos de 5 fotos y descuenta 6", () => {
    const [h] = auditarFicha(con({ cantidadFotos: 4 }));
    expect(h.codigo).toBe("ficha_pocas_fotos");
    expect(h.puntosPerdidos).toBe(6);
  });

  it("acepta exactamente 5 fotos", () => {
    expect(auditarFicha(con({ cantidadFotos: 5 }))).toEqual([]);
  });

  it("detecta el negocio marcado como cerrado y lo marca grave", () => {
    const [h] = auditarFicha(con({ estadoOperativo: "cerrado_definitivo" }));
    expect(h.codigo).toBe("ficha_cerrado");
    expect(h.puntosPerdidos).toBe(4);
    expect(h.gravedad).toBe("alta");
  });

  it("suma exactamente 40 puntos perdidos en la ficha más rota posible", () => {
    const hallazgos = auditarFicha({
      ...fichaPerfecta,
      telefono: null,
      sitioWeb: null,
      diasConHorario: 0,
      rubro: null,
      cantidadFotos: 0,
      estadoOperativo: "cerrado_definitivo",
    });
    const total = hallazgos.reduce((s, h) => s + h.puntosPerdidos, 0);
    expect(total).toBe(PUNTOS_FICHA);
  });
});
