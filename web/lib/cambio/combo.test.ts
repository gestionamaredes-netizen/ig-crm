import { describe, it, expect } from "vitest";
import { filtrarOpciones, hayCoincidenciaExacta, valorASubmit, type OpcionCombo } from "./combo";

const OPS: OpcionCombo[] = [
  { value: "1", nombre: "Juan Perez" },
  { value: "2", nombre: "Maria Gomez" },
  { value: "3", nombre: "Ana Perez" },
];

describe("filtrarOpciones", () => {
  it("con texto vacío devuelve todas", () => {
    expect(filtrarOpciones(OPS, "")).toHaveLength(3);
  });

  it("filtra por coincidencia parcial, sin importar mayúsculas", () => {
    expect(filtrarOpciones(OPS, "perez").map((o) => o.nombre)).toEqual(["Juan Perez", "Ana Perez"]);
  });

  it("ignora espacios al principio y al final del texto", () => {
    expect(filtrarOpciones(OPS, "  maria ").map((o) => o.nombre)).toEqual(["Maria Gomez"]);
  });

  it("sin coincidencias devuelve lista vacía", () => {
    expect(filtrarOpciones(OPS, "xyz")).toEqual([]);
  });
});

describe("hayCoincidenciaExacta", () => {
  it("detecta un nombre igual ignorando mayúsculas y espacios", () => {
    expect(hayCoincidenciaExacta(OPS, "  juan perez ")).toBe(true);
  });

  it("un nombre parcial no es coincidencia exacta", () => {
    expect(hayCoincidenciaExacta(OPS, "juan")).toBe(false);
  });

  it("texto vacío no es coincidencia exacta", () => {
    expect(hayCoincidenciaExacta(OPS, "")).toBe(false);
  });
});

describe("valorASubmit", () => {
  it("si hay una opción elegida, envía su value", () => {
    expect(valorASubmit({ value: "2", nombre: "Maria Gomez" }, "otra cosa", false)).toBe("2");
  });

  it("sin selección y permitiendo texto libre, envía el texto recortado", () => {
    // El caso del emisor/receptor que aparece una sola vez: se guarda tal cual.
    expect(valorASubmit(null, "  Deposito Sur  ", true)).toBe("Deposito Sur");
  });

  it("sin selección y sin permitir texto libre, envía cadena vacía", () => {
    // El caso del cliente: no puede ser texto suelto porque va como FK.
    expect(valorASubmit(null, "algo tipeado", false)).toBe("");
  });
});
