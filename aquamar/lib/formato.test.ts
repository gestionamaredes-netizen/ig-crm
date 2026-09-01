import { describe, it, expect } from "vitest";
import { parsearMonto, parsearEntero, formatearFecha, centavosAInput } from "./formato";

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
