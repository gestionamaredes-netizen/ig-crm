import { describe, it, expect } from "vitest";
import { parsearMonto, parsearCantidad, validarTotal } from "@/lib/finanzas/montos";

describe("parsearMonto", () => {
  it("un número simple sin separadores", () => {
    expect(parsearMonto("34000")).toBe(34000);
  });

  it("acepta punto decimal internacional con 1-2 dígitos (4925.00 = 4925)", () => {
    expect(parsearMonto("4925.00")).toBe(4925);
    expect(parsearMonto("5000.00")).toBe(5000);
    expect(parsearMonto("12.5")).toBe(12.5);
    expect(parsearMonto("100.50")).toBe(100.5);
  });

  it("un punto con 3 dígitos sigue siendo miles, no decimal (1.520 = 1520)", () => {
    expect(parsearMonto("1.520")).toBe(1520);
    expect(parsearMonto("1.500")).toBe(1500);
    expect(parsearMonto("1.234.567")).toBe(1234567);
  });

  it("el punto es separador de miles", () => {
    expect(parsearMonto("34.000")).toBe(34000);
  });

  it("caso del bug: coma decimal no se puede leer como miles", () => {
    // Con el parser viejo (que borraba todo lo que no fuera dígito),
    // "1.500,50" pasaba a ser 150050: cien veces el monto real.
    expect(parsearMonto("1.500,50")).toBe(1500.5);
  });

  it("coma decimal sin separador de miles", () => {
    expect(parsearMonto("1500,50")).toBe(1500.5);
  });

  it("tolera un símbolo de moneda al principio", () => {
    expect(parsearMonto("$34.000")).toBe(34000);
  });

  it("tolera espacios alrededor", () => {
    expect(parsearMonto(" 34.000 ")).toBe(34000);
  });

  it("vacío no es un monto", () => {
    expect(parsearMonto("")).toBeNull();
  });

  it("texto sin dígitos no es un monto", () => {
    expect(parsearMonto("abc")).toBeNull();
  });

  it("cero no es un gasto real", () => {
    expect(parsearMonto("0")).toBeNull();
  });

  it("negativo no se vuelve positivo en silencio", () => {
    expect(parsearMonto("-500")).toBeNull();
  });

  it("más de un separador decimal no es un número", () => {
    expect(parsearMonto("1,5,3")).toBeNull();
  });

  it("un monto con miles y sin decimales sigue andando", () => {
    expect(parsearMonto("1.234.567")).toBe(1234567);
  });

  it("un monto con miles y decimales", () => {
    expect(parsearMonto("1.234.567,89")).toBe(1234567.89);
  });

  it("null como entrada no es un monto", () => {
    // @ts-expect-error se ejercita el caso de un valor no-string llegando en runtime
    expect(parsearMonto(null)).toBeNull();
  });

  // Notación US/internacional ("1500.50", "1.50", "100.5"): un punto seguido de
  // 1-2 dígitos se acepta como DECIMAL, no como miles. Clave: se lee al valor
  // correcto (1500.5), NO se infla 100x (150050) como sería el bug histórico.
  // Un grupo de miles a la argentina tiene 3 dígitos, así que no hay ambigüedad.
  it("punto decimal US con 1-2 dígitos: se lee al valor correcto, no se infla 100x", () => {
    expect(parsearMonto("1500.50")).toBe(1500.5);
    expect(parsearMonto("1.50")).toBe(1.5);
    expect(parsearMonto("100.5")).toBe(100.5);
  });

  it("coma de miles seguida de punto decimal (orden invertido) se rechaza", () => {
    expect(parsearMonto("1,500.50")).toBeNull();
  });

  it("punto sin dígitos antes se rechaza", () => {
    expect(parsearMonto(".50")).toBeNull();
  });

  it("punto sin dígitos después se rechaza", () => {
    expect(parsearMonto("1.")).toBeNull();
  });

  it("grupo de miles de más de 3 dígitos tras el punto se rechaza", () => {
    expect(parsearMonto("1.5000")).toBeNull();
  });

  it("tres decimales no es un monto en pesos", () => {
    expect(parsearMonto("1500,555")).toBeNull();
  });

  it("un monto por encima del techo de precisión se rechaza", () => {
    expect(parsearMonto("1000000000000")).toBeNull();
  });

  it("un monto justo por debajo del techo de precisión es válido", () => {
    expect(parsearMonto("999.999.999.999")).toBe(999999999999);
  });

  it("notación científica no es una forma válida de escribir un monto", () => {
    expect(parsearMonto("1e5")).toBeNull();
  });

  it("un espacio en medio del monto no es un separador válido", () => {
    expect(parsearMonto("1 500")).toBeNull();
  });

  it("el símbolo de moneda sin dígitos detrás no es un monto", () => {
    expect(parsearMonto("$")).toBeNull();
  });

  it("un separador de miles duplicado no forma un grupo válido", () => {
    expect(parsearMonto("1..500")).toBeNull();
  });

  it("un punto final sin grupo de miles detrás no es un separador válido", () => {
    expect(parsearMonto("1.500.")).toBeNull();
  });

  it("una coma decimal sin parte entera no es un monto", () => {
    expect(parsearMonto(",50")).toBeNull();
  });
});

describe("parsearCantidad", () => {
  it("un entero simple", () => {
    expect(parsearCantidad("3")).toBe(3);
  });

  it("vacío no es una cantidad", () => {
    expect(parsearCantidad("")).toBeNull();
  });

  it("cero no es una cantidad", () => {
    expect(parsearCantidad("0")).toBeNull();
  });

  it("negativo no es una cantidad", () => {
    expect(parsearCantidad("-2")).toBeNull();
  });

  it("una cantidad fraccionaria se rechaza en vez de redondearse", () => {
    expect(parsearCantidad("1,5")).toBeNull();
  });

  it("texto no es una cantidad", () => {
    expect(parsearCantidad("abc")).toBeNull();
  });

  it("tolera espacios alrededor", () => {
    expect(parsearCantidad(" 3 ")).toBe(3);
  });

  it("una cantidad absurdamente grande se rechaza", () => {
    expect(parsearCantidad("1000000000000")).toBeNull();
  });
});

describe("validarTotal", () => {
  it("un total dentro del techo es válido", () => {
    expect(validarTotal(102000)).toBe(102000);
  });

  it("un total justo por debajo del techo es válido", () => {
    expect(validarTotal(999999999999)).toBe(999999999999);
  });

  it("un unitario y una cantidad cada uno bajo su propio límite pueden multiplicarse por encima del techo", () => {
    // unitario < TECHO_MONTO (parsearMonto lo aceptaría) y cantidad < TECHO_CANTIDAD
    // (parsearCantidad la aceptaría), pero el producto que se guarda ya no es
    // un monto plausible ni preciso en float64.
    const unitario = 999_999_999_999;
    const cantidad = 1000;
    expect(validarTotal(unitario * cantidad)).toBeNull();
  });

  it("un total exactamente igual al techo se rechaza", () => {
    expect(validarTotal(1e12)).toBeNull();
  });

  it("cero no es un total válido", () => {
    expect(validarTotal(0)).toBeNull();
  });

  it("negativo no es un total válido", () => {
    expect(validarTotal(-500)).toBeNull();
  });

  it("NaN no es un total válido", () => {
    expect(validarTotal(NaN)).toBeNull();
  });

  it("Infinity no es un total válido", () => {
    expect(validarTotal(Infinity)).toBeNull();
  });
});
