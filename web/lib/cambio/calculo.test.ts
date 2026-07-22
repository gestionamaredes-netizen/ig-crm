import { describe, it, expect } from "vitest";
import { importes, calcular } from "./calculo";
import type { Operacion } from "./tipos";

function op(over: Partial<Operacion> & Pick<Operacion, "fecha" | "tipo" | "monto" | "moneda" | "tc">): Operacion {
  return {
    id: over.fecha + over.tipo + over.monto,
    creadaEn: `${over.fecha}T10:00:00Z`,
    clienteId: null,
    cliente: "",
    emisor: "",
    receptor: "",
    cajaArsId: null,
    cajaUsdId: null,
    costos: 0,
    notas: "",
    ...over,
  };
}

describe("importes", () => {
  it("con monto en USD, los pesos salen de multiplicar por el TC", () => {
    expect(importes({ monto: 1000, moneda: "USD", tc: 1400 })).toEqual({ usd: 1000, ars: 1400000 });
  });

  it("con monto en ARS, los dólares salen de dividir por el TC", () => {
    // El caso que motivó el módulo: el usuario recibe 452.500 pesos a 1520 y
    // no tiene por qué hacer la división a mano.
    const { usd, ars } = importes({ monto: 452500, moneda: "ARS", tc: 1520 });
    expect(ars).toBe(452500);
    expect(usd).toBeCloseTo(297.6973684, 6);
  });

  it("con TC cero devuelve ceros en vez de dividir por cero", () => {
    expect(importes({ monto: 452500, moneda: "ARS", tc: 0 })).toEqual({ usd: 0, ars: 0 });
  });
});

describe("calcular", () => {
  it("una compra deja el costo promedio en el TC de esa compra", () => {
    const [r] = calcular([op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 })]);
    expect(r.stock).toBe(1000);
    expect(r.costoPromedio).toBe(1400);
    expect(r.margen).toBe(0);
  });

  it("una segunda compra promedia los dos lotes", () => {
    const r = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 730000, moneda: "ARS", tc: 1460 }),
    ]);
    expect(r[1].usd).toBe(500);
    expect(r[1].stock).toBe(1500);
    expect(r[1].costoPromedio).toBe(1420);
  });

  it("una venta genera margen contra el costo promedio previo, neto de costos", () => {
    const r = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 730000, moneda: "ARS", tc: 1460 }),
      op({ fecha: "2026-07-03", tipo: "venta", monto: 800, moneda: "USD", tc: 1480, costos: 5000 }),
    ]);
    // 800 × (1480 − 1420) = 48.000, menos 5.000 de costos
    expect(r[2].margen).toBe(43000);
    expect(r[2].stock).toBe(700);
    expect(r[2].costoPromedio).toBe(1420);
  });

  it("caso de referencia completo del spec", () => {
    const r = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 730000, moneda: "ARS", tc: 1460 }),
      op({ fecha: "2026-07-03", tipo: "venta", monto: 800, moneda: "USD", tc: 1480, costos: 5000 }),
      op({ fecha: "2026-07-04", tipo: "venta", monto: 452500, moneda: "ARS", tc: 1520 }),
    ]);
    expect(r[3].usd).toBeCloseTo(297.6973684, 6);
    expect(r[3].ars).toBe(452500);
    expect(r[3].margen).toBeCloseTo(29769.74, 2);
    expect(r[3].stock).toBeCloseTo(402.3026316, 6);
    expect(r[3].costoTotal).toBeCloseTo(571269.74, 2);
    expect(r.reduce((s, x) => s + x.margen, 0)).toBeCloseTo(72769.74, 2);
  });

  it("ordena por fecha antes de calcular: el orden de carga no cambia el resultado", () => {
    // Ésta es la diferencia central con la planilla, donde cargar una
    // operación fuera de orden rompía todos los números de abajo.
    const desordenadas = calcular([
      op({ fecha: "2026-07-03", tipo: "venta", monto: 800, moneda: "USD", tc: 1480, costos: 5000 }),
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 730000, moneda: "ARS", tc: 1460 }),
    ]);
    expect(desordenadas.map((x) => x.fecha)).toEqual(["2026-07-01", "2026-07-02", "2026-07-03"]);
    expect(desordenadas[2].margen).toBe(43000);
  });

  it("desempata por creadaEn dentro del mismo día", () => {
    const r = calcular([
      { ...op({ fecha: "2026-07-01", tipo: "venta", monto: 100, moneda: "USD", tc: 1500 }), id: "b", creadaEn: "2026-07-01T12:00:00Z" },
      { ...op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400 }), id: "a", creadaEn: "2026-07-01T09:00:00Z" },
    ]);
    expect(r.map((x) => x.id)).toEqual(["a", "b"]);
    expect(r[1].margen).toBe(10000);
  });

  it("vender más de lo que hay deja el stock negativo en vez de fingir que cierra", () => {
    // Es una señal de carga: falta una compra. Se muestra en rojo en la UI,
    // no se corrige en silencio.
    const r = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "venta", monto: 150, moneda: "USD", tc: 1500 }),
    ]);
    expect(r[1].stock).toBe(-50);
    // Sin stock no hay costo promedio nuevo: se conserva el último válido.
    expect(r[1].costoPromedio).toBe(1400);
  });

  it("no muta el array que recibe", () => {
    const entrada = [
      op({ fecha: "2026-07-03", tipo: "compra", monto: 1, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1, moneda: "USD", tc: 1400 }),
    ];
    calcular(entrada);
    expect(entrada.map((x) => x.fecha)).toEqual(["2026-07-03", "2026-07-01"]);
  });
});
