import { describe, it, expect } from "vitest";
import { auditarReputacion, PUNTOS_REPUTACION } from "@/lib/seo-local/reglas-reputacion";
import type { FichaNegocio } from "@/lib/seo-local/tipos";

const AHORA = new Date("2026-07-19T00:00:00.000Z");

const fichaSana: FichaNegocio = {
  idExterno: "places/sana",
  nombre: "Panadería Modelo",
  rubro: "bakery",
  direccion: "Gorriti 1200",
  ubicacion: { lat: -34.605, lng: -58.865 },
  telefono: "+54 237 400-0000",
  sitioWeb: "https://ejemplo.com.ar",
  diasConHorario: 7,
  puntaje: 4.6,
  cantidadResenas: 80,
  fechaResenaMasReciente: "2026-07-10T00:00:00.000Z",
  cantidadFotos: 10,
  estadoOperativo: "abierto",
};

const con = (cambios: Partial<FichaNegocio>): FichaNegocio => ({ ...fichaSana, ...cambios });

describe("auditarReputacion", () => {
  it("no encuentra nada en un negocio con buena reputación", () => {
    const { hallazgos, noEvaluados } = auditarReputacion(fichaSana, AHORA);
    expect(hallazgos).toEqual([]);
    expect(noEvaluados).toEqual([]);
  });

  it("detecta puntaje menor a 4.0 y descuenta 12", () => {
    const { hallazgos } = auditarReputacion(con({ puntaje: 3.9 }), AHORA);
    const h = hallazgos.find((x) => x.codigo === "rep_puntaje_bajo");
    expect(h?.puntosPerdidos).toBe(12);
  });

  it("acepta exactamente 4.0", () => {
    const { hallazgos } = auditarReputacion(con({ puntaje: 4.0 }), AHORA);
    expect(hallazgos.find((x) => x.codigo === "rep_puntaje_bajo")).toBeUndefined();
  });

  it("detecta menos de 10 reseñas y descuenta 12", () => {
    const { hallazgos } = auditarReputacion(con({ cantidadResenas: 9 }), AHORA);
    const h = hallazgos.find((x) => x.codigo === "rep_pocas_resenas");
    expect(h?.puntosPerdidos).toBe(12);
  });

  it("detecta reseñas de más de 6 meses y descuenta 6", () => {
    const { hallazgos } = auditarReputacion(
      con({ fechaResenaMasReciente: "2025-12-01T00:00:00.000Z" }),
      AHORA,
    );
    const h = hallazgos.find((x) => x.codigo === "rep_resenas_viejas");
    expect(h?.puntosPerdidos).toBe(6);
  });

  it("no marca como viejas las reseñas de hace 3 meses", () => {
    const { hallazgos } = auditarReputacion(
      con({ fechaResenaMasReciente: "2026-04-19T00:00:00.000Z" }),
      AHORA,
    );
    expect(hallazgos.find((x) => x.codigo === "rep_resenas_viejas")).toBeUndefined();
  });

  it("con cero reseñas descuenta todo el bloque y no evalúa puntaje ni antigüedad", () => {
    const { hallazgos, noEvaluados } = auditarReputacion(
      con({ cantidadResenas: 0, puntaje: null, fechaResenaMasReciente: null }),
      AHORA,
    );
    const total = hallazgos.reduce((s, h) => s + h.puntosPerdidos, 0);
    expect(total).toBe(PUNTOS_REPUTACION);
    expect(noEvaluados).toEqual([]);
    expect(hallazgos.find((x) => x.codigo === "rep_sin_resenas")).toBeDefined();
  });

  it("declara no evaluado el puntaje si falta el dato pero hay reseñas", () => {
    const { noEvaluados } = auditarReputacion(con({ puntaje: null }), AHORA);
    expect(noEvaluados).toContain("rep_puntaje_bajo");
  });

  it("suma exactamente 30 puntos en el peor caso con reseñas", () => {
    const { hallazgos } = auditarReputacion(
      con({ puntaje: 2.0, cantidadResenas: 3, fechaResenaMasReciente: "2024-01-01T00:00:00.000Z" }),
      AHORA,
    );
    const total = hallazgos.reduce((s, h) => s + h.puntosPerdidos, 0);
    expect(total).toBe(PUNTOS_REPUTACION);
  });
});
