import { describe, it, expect } from "vitest";
import { totalDeCargas, subtotalPorCuenta, claveCarga, type Carga } from "@/lib/cambio/cargas";

function carga(over: Partial<Carga>): Carga {
  return {
    id: "c1", fecha: "2026-07-31", runnerId: "r1", origen: "operativa", sourceId: "a1",
    titular: "Juan", etiqueta: "Zurdo 1", pesosCargados: 0, usdComprados: 0, usdRetirados: 0, ...over,
  };
}

describe("totalDeCargas", () => {
  it("suma las tres columnas y cuenta", () => {
    const t = totalDeCargas([
      carga({ pesosCargados: 100, usdComprados: 10, usdRetirados: 9 }),
      carga({ pesosCargados: 200, usdComprados: 20, usdRetirados: 18 }),
    ]);
    expect(t).toEqual({ pesosCargados: 300, usdComprados: 30, usdRetirados: 27, cantidad: 2 });
  });
  it("lista vacía da todo en cero", () => {
    expect(totalDeCargas([])).toEqual({ pesosCargados: 0, usdComprados: 0, usdRetirados: 0, cantidad: 0 });
  });
});

describe("subtotalPorCuenta", () => {
  it("agrupa por origen:sourceId y ordena por pesos desc", () => {
    const r = subtotalPorCuenta([
      carga({ origen: "operativa", sourceId: "a1", pesosCargados: 100 }),
      carga({ origen: "bancaria", sourceId: "b1", titular: "Ana", etiqueta: "Bancaria", pesosCargados: 300 }),
      carga({ origen: "operativa", sourceId: "a1", pesosCargados: 50, fecha: "2026-07-30" }),
    ]);
    expect(r.map((s) => s.clave)).toEqual(["bancaria:b1", "operativa:a1"]);
    expect(r.find((s) => s.clave === "operativa:a1")).toMatchObject({ pesosCargados: 150, cantidad: 2 });
  });
});

describe("claveCarga", () => {
  it("arma origen:sourceId", () => {
    expect(claveCarga("bancaria", "x")).toBe("bancaria:x");
  });
});
