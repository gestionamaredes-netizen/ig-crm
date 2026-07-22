import { describe, it, expect } from "vitest";
import { parsearMonto, parsearCantidad } from "@/lib/finanzas/montos";

describe("parsearMonto", () => {
  it("un número simple sin separadores", () => {
    expect(parsearMonto("34000")).toBe(34000);
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

  // Notación US/internacional ("1500.50") no es una entrada ambigua que se
  // pueda "adivinar": es una convención distinta a la argentina, y adivinar
  // mal infla el monto 100x en silencio. Se rechaza en vez de interpretar.
  it("punto como decimal (notación US) se rechaza, no se infla 100x", () => {
    expect(parsearMonto("1500.50")).toBeNull();
  });

  it("un solo dígito antes del punto sin formar un grupo de miles se rechaza", () => {
    expect(parsearMonto("1.50")).toBeNull();
  });

  it("coma de miles seguida de punto decimal (orden invertido) se rechaza", () => {
    expect(parsearMonto("1,500.50")).toBeNull();
  });

  it("grupo de miles incompleto tras el punto se rechaza", () => {
    expect(parsearMonto("100.5")).toBeNull();
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
