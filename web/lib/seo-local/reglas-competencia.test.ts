import { describe, it, expect } from "vitest";
import { auditarCompetencia, PUNTOS_COMPETENCIA } from "@/lib/seo-local/reglas-competencia";
import type { FichaNegocio } from "@/lib/seo-local/tipos";

const base: FichaNegocio = {
  idExterno: "places/base",
  nombre: "Negocio",
  rubro: "bakery",
  direccion: "Gorriti 1200",
  ubicacion: { lat: -34.605, lng: -58.865 },
  telefono: "+54 237 400-0000",
  sitioWeb: "https://ejemplo.com.ar",
  diasConHorario: 7,
  puntaje: 4.5,
  cantidadResenas: 50,
  fechaResenaMasReciente: "2026-07-10T00:00:00.000Z",
  cantidadFotos: 10,
  estadoOperativo: "abierto",
};

const rival = (id: string, resenas: number, puntaje: number): FichaNegocio => ({
  ...base,
  idExterno: id,
  nombre: `Rival ${id}`,
  cantidadResenas: resenas,
  puntaje,
});

describe("auditarCompetencia", () => {
  it("no penaliza al líder del rubro", () => {
    const { hallazgos, puestoPorResenas } = auditarCompetencia(base, {
      competidores: [rival("a", 10, 3.0), rival("b", 20, 3.5)],
      posicionEnBusqueda: 1,
    });
    expect(puestoPorResenas).toBe(1);
    expect(hallazgos).toEqual([]);
  });

  it("calcula el puesto por reseñas contando a los competidores", () => {
    const { puestoPorResenas, totalEnRubro } = auditarCompetencia(base, {
      competidores: [rival("a", 100, 4.8), rival("b", 80, 4.7), rival("c", 10, 4.0)],
      posicionEnBusqueda: 1,
    });
    expect(puestoPorResenas).toBe(3);
    expect(totalEnRubro).toBe(4);
  });

  it("dice cuántas reseñas faltan para pasar al de arriba", () => {
    const { resenasParaSubirUnPuesto } = auditarCompetencia(base, {
      competidores: [rival("a", 64, 4.8)],
      posicionEnBusqueda: 1,
    });
    expect(resenasParaSubirUnPuesto).toBe(15);
  });

  it("devuelve null en reseñas para subir si ya es primero", () => {
    const { resenasParaSubirUnPuesto } = auditarCompetencia(base, {
      competidores: [rival("a", 10, 3.0)],
      posicionEnBusqueda: 1,
    });
    expect(resenasParaSubirUnPuesto).toBeNull();
  });

  it("penaliza con 12 estar en el tercio inferior por reseñas", () => {
    const { hallazgos } = auditarCompetencia(base, {
      competidores: [rival("a", 300, 4.9), rival("b", 200, 4.8), rival("c", 150, 4.7), rival("d", 120, 4.6), rival("e", 100, 4.5)],
      posicionEnBusqueda: 1,
    });
    const h = hallazgos.find((x) => x.codigo === "comp_puesto_resenas");
    expect(h?.puntosPerdidos).toBe(12);
  });

  it("penaliza con 8 estar en el tercio inferior por puntaje", () => {
    const { hallazgos } = auditarCompetencia({ ...base, puntaje: 3.1 }, {
      competidores: [rival("a", 10, 4.9), rival("b", 10, 4.8), rival("c", 10, 4.7)],
      posicionEnBusqueda: 1,
    });
    const h = hallazgos.find((x) => x.codigo === "comp_puesto_puntaje");
    expect(h?.puntosPerdidos).toBe(8);
  });

  it("penaliza con 10 no aparecer en la búsqueda", () => {
    const { hallazgos } = auditarCompetencia(base, {
      competidores: [rival("a", 10, 3.0)],
      posicionEnBusqueda: "no_aparece",
    });
    const h = hallazgos.find((x) => x.codigo === "comp_fuera_de_busqueda");
    expect(h?.puntosPerdidos).toBe(10);
  });

  it("penaliza con 10 quedar más abajo del puesto 5", () => {
    const { hallazgos } = auditarCompetencia(base, {
      competidores: [rival("a", 10, 3.0)],
      posicionEnBusqueda: 6,
    });
    expect(hallazgos.find((x) => x.codigo === "comp_fuera_de_busqueda")).toBeDefined();
  });

  it("acepta el puesto 5 en la búsqueda", () => {
    const { hallazgos } = auditarCompetencia(base, {
      competidores: [rival("a", 10, 3.0)],
      posicionEnBusqueda: 5,
    });
    expect(hallazgos.find((x) => x.codigo === "comp_fuera_de_busqueda")).toBeUndefined();
  });

  it("declara no evaluada la búsqueda si no se corrió", () => {
    const { noEvaluados, hallazgos } = auditarCompetencia(base, {
      competidores: [rival("a", 10, 3.0)],
      posicionEnBusqueda: "no_evaluado",
    });
    expect(noEvaluados).toContain("comp_fuera_de_busqueda");
    expect(hallazgos.find((x) => x.codigo === "comp_fuera_de_busqueda")).toBeUndefined();
  });

  it("sin competidores no evalúa los puestos y no inventa penalización", () => {
    const { hallazgos, noEvaluados, puestoPorResenas, totalEnRubro } = auditarCompetencia(base, {
      competidores: [],
      posicionEnBusqueda: 1,
    });
    expect(hallazgos).toEqual([]);
    expect(noEvaluados).toContain("comp_puesto_resenas");
    expect(noEvaluados).toContain("comp_puesto_puntaje");
    expect(puestoPorResenas).toBeNull();
    expect(totalEnRubro).toBe(1);
  });

  it("suma exactamente 30 puntos en el peor caso", () => {
    const { hallazgos } = auditarCompetencia({ ...base, cantidadResenas: 1, puntaje: 2.0 }, {
      competidores: [rival("a", 300, 4.9), rival("b", 200, 4.8), rival("c", 150, 4.7)],
      posicionEnBusqueda: "no_aparece",
    });
    const total = hallazgos.reduce((s, h) => s + h.puntosPerdidos, 0);
    expect(total).toBe(PUNTOS_COMPETENCIA);
  });
});
