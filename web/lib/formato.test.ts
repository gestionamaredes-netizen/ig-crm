import { describe, it, expect } from "vitest";
import { formatearPesos } from "@/lib/formato";

describe("formatearPesos", () => {
  it("usa separador de miles argentino", () => {
    expect(formatearPesos(1234567)).toBe("$1.234.567");
  });

  it("muestra el cero sin adornos", () => {
    expect(formatearPesos(0)).toBe("$0");
  });

  it("redondea los centavos", () => {
    expect(formatearPesos(2000.4)).toBe("$2.000");
  });

  it("redondea para arriba a partir de medio peso", () => {
    expect(formatearPesos(2000.5)).toBe("$2.001");
  });

  it("pone el signo antes del símbolo de moneda para un negativo", () => {
    expect(formatearPesos(-1234)).toBe("-$1.234");
  });

  it("no antepone signo para el cero", () => {
    expect(formatearPesos(0)).toBe("$0");
  });

  it("no antepone signo para un positivo", () => {
    expect(formatearPesos(1234)).toBe("$1.234");
  });
});
