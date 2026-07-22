import { describe, it, expect } from "vitest";
import { auditar, resumenDeVenta } from "@/lib/seo-local/auditoria";
import type { FichaNegocio, RevisionManual } from "@/lib/seo-local/tipos";

const AHORA = new Date("2026-07-19T00:00:00.000Z");

const perfecta: FichaNegocio = {
  idExterno: "places/perfecta",
  nombre: "Panadería Modelo",
  rubro: "bakery",
  direccion: "Gorriti 1200",
  ubicacion: { lat: -34.605, lng: -58.865 },
  telefono: "+54 237 400-0000",
  sitioWeb: "https://ejemplo.com.ar",
  diasConHorario: 7,
  puntaje: 4.8,
  cantidadResenas: 200,
  fechaResenaMasReciente: "2026-07-15T00:00:00.000Z",
  cantidadFotos: 20,
  estadoOperativo: "abierto",
};

const manualOk: RevisionManual = { fichaReclamada: true, respondeResenas: true };
const sinVerificar: RevisionManual = { fichaReclamada: null, respondeResenas: null };

describe("auditar", () => {
  it("da 100 a un negocio impecable y líder", () => {
    const a = auditar(perfecta, { competidores: [], posicionEnBusqueda: 1 }, manualOk, AHORA);
    expect(a.puntajeTotal).toBe(100);
    expect(a.puntajeFicha).toBe(40);
    expect(a.puntajeReputacion).toBe(30);
    expect(a.puntajeCompetencia).toBe(30);
    expect(a.penalizacionManual).toBe(0);
  });

  it("descuenta 10 si la ficha no está reclamada", () => {
    const a = auditar(
      perfecta,
      { competidores: [], posicionEnBusqueda: 1 },
      { fichaReclamada: false, respondeResenas: true },
      AHORA,
    );
    expect(a.penalizacionManual).toBe(10);
    expect(a.puntajeTotal).toBe(90);
  });

  it("descuenta 5 si no responde reseñas", () => {
    const a = auditar(
      perfecta,
      { competidores: [], posicionEnBusqueda: 1 },
      { fichaReclamada: true, respondeResenas: false },
      AHORA,
    );
    expect(a.penalizacionManual).toBe(5);
    expect(a.puntajeTotal).toBe(95);
  });

  it("no penaliza lo que todavía no se verificó, pero lo declara", () => {
    const a = auditar(perfecta, { competidores: [], posicionEnBusqueda: 1 }, sinVerificar, AHORA);
    expect(a.penalizacionManual).toBe(0);
    expect(a.noEvaluados).toContain("manual_ficha_reclamada");
    expect(a.noEvaluados).toContain("manual_responde_resenas");
  });

  it("nunca baja de 0 aunque las penalizaciones se pasen", () => {
    const rota: FichaNegocio = {
      ...perfecta,
      rubro: null,
      telefono: null,
      sitioWeb: null,
      diasConHorario: 0,
      cantidadFotos: 0,
      estadoOperativo: "cerrado_definitivo",
      puntaje: null,
      cantidadResenas: 0,
      fechaResenaMasReciente: null,
    };
    // Con rivales muy por encima, los tres bloques quedan casi en cero y las
    // penalizaciones manuales empujan el total por debajo de 0. Debe cortar en 0.
    const rival = (id: string, resenas: number): FichaNegocio => ({
      ...perfecta,
      idExterno: id,
      cantidadResenas: resenas,
    });
    const a = auditar(
      rota,
      {
        competidores: [rival("a", 300), rival("b", 200), rival("c", 150)],
        posicionEnBusqueda: "no_aparece",
      },
      { fichaReclamada: false, respondeResenas: false },
      AHORA,
    );
    expect(a.puntajeFicha).toBe(0);
    expect(a.puntajeReputacion).toBe(0);
    expect(a.penalizacionManual).toBe(15);
    expect(a.puntajeTotal).toBe(0);
  });

  it("los puntajes por bloque nunca son negativos", () => {
    const a = auditar(
      { ...perfecta, cantidadResenas: 0, puntaje: null, fechaResenaMasReciente: null },
      { competidores: [], posicionEnBusqueda: 1 },
      manualOk,
      AHORA,
    );
    expect(a.puntajeReputacion).toBe(0);
    expect(a.puntajeFicha).toBe(40);
  });

  it("arrastra el puesto y la brecha de reseñas al resultado", () => {
    const rival: FichaNegocio = { ...perfecta, idExterno: "r", cantidadResenas: 250 };
    const a = auditar(
      perfecta,
      { competidores: [rival], posicionEnBusqueda: 1 },
      manualOk,
      AHORA,
    );
    expect(a.puestoPorResenas).toBe(2);
    expect(a.totalEnRubro).toBe(2);
    expect(a.resenasParaSubirUnPuesto).toBe(51);
  });
});

describe("resumenDeVenta", () => {
  it("arma la frase con el puesto y la brecha", () => {
    const rival: FichaNegocio = { ...perfecta, idExterno: "r", cantidadResenas: 250 };
    const a = auditar(perfecta, { competidores: [rival], posicionEnBusqueda: 1 }, manualOk, AHORA);
    expect(resumenDeVenta(a)).toBe(
      "Estás 2º de 2 en tu rubro. Con 51 reseñas más pasás al puesto de arriba.",
    );
  });

  it("felicita al líder cuando hay competidores por debajo", () => {
    const rival: FichaNegocio = { ...perfecta, idExterno: "r", cantidadResenas: 10 };
    const a = auditar(perfecta, { competidores: [rival], posicionEnBusqueda: 1 }, manualOk, AHORA);
    expect(resumenDeVenta(a)).toBe("Sos el mejor posicionado de tu rubro en la zona.");
  });

  it("no afirma liderazgo cuando no hay con quién comparar", () => {
    const a = auditar(perfecta, { competidores: [], posicionEnBusqueda: 1 }, manualOk, AHORA);
    expect(resumenDeVenta(a)).toBe(
      "Todavía no hay competidores cargados de tu rubro en la zona para comparar.",
    );
  });
});
