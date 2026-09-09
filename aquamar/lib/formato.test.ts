import { describe, it, expect } from "vitest";
import { centavosAInput, desdeBultos, enBultos, formatearFecha, parsearEntero, parsearMonto, textoBultos } from "./formato";

describe("parsearMonto", () => {
  it("lee formato argentino con miles y decimales", () => {
    expect(parsearMonto("1.234,50")).toBe(123450);
    expect(parsearMonto("$ 1.234,50")).toBe(123450);
    expect(parsearMonto("12.500")).toBe(1250000);
  });

  it("lee números simples", () => {
    expect(parsearMonto("1500")).toBe(150000);
    expect(parsearMonto("1500,5")).toBe(150050);
    expect(parsearMonto("0,99")).toBe(99);
  });

  it("acepta el punto como decimal cuando no puede ser miles", () => {
    expect(parsearMonto("12.5")).toBe(1250);
    expect(parsearMonto("12.50")).toBe(1250);
  });

  it("rechaza basura en vez de inventar un número", () => {
    expect(parsearMonto("")).toBeNull();
    expect(parsearMonto("abc")).toBeNull();
    expect(parsearMonto("1,2,3")).toBeNull();
    expect(parsearMonto("1.2345")).toBeNull();
  });
});

describe("parsearEntero", () => {
  it("lee cantidades", () => {
    expect(parsearEntero("12")).toBe(12);
    expect(parsearEntero("1.200")).toBe(1200);
    expect(parsearEntero("x")).toBeNull();
    expect(parsearEntero("")).toBeNull();
  });
});

describe("formato de salida", () => {
  it("da vuelta la fecha ISO", () => {
    expect(formatearFecha("2026-09-01")).toBe("01/09/2026");
  });

  it("convierte centavos a texto de input", () => {
    expect(centavosAInput(123450)).toBe("1234,50");
  });
});

describe("bultos", () => {
  it("parte las unidades en bultos y sueltas", () => {
    expect(textoBultos(480, 12)).toBe("40 bultos");
    expect(textoBultos(485, 12)).toBe("40 bultos + 5");
    expect(textoBultos(7, 12)).toBe("7 sueltas");
    // Un producto sin stock dice "0", no "0 sueltas": eso se lee como ruido.
    expect(textoBultos(0, 12)).toBe("0");
  });

  it("convierte bultos a unidades", () => {
    expect(desdeBultos(40, 12)).toBe(480);
    expect(desdeBultos(3, 20)).toBe(60);
  });

  /*
   * Un producto que se vende suelto tiene 1 unidad por bulto. Sin este caso, la
   * cuenta diría "480 bultos + 0" para algo que no viene en bultos, y peor: con
   * cero quedaría dividiendo por cero.
   */
  it("no inventa bultos cuando el producto se vende suelto", () => {
    expect(textoBultos(480, 1)).toBe("480");
    expect(textoBultos(480, 0)).toBe("480");
    expect(desdeBultos(5, 0)).toBe(5);
    expect(enBultos(480, 1)).toEqual({ bultos: 480, sueltas: 0 });
  });
});
