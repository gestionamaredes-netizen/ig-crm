import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock encadenable: select/eq/gte/lte/order devuelven el mismo `chain`, y el
// `chain` es "awaitable" (tiene `then`) resolviendo a `result`. Así cubre tanto
// getCargasDelDia (`.eq().order()`) como getCargasEnRango (`.gte().lte().order().order()`)
// sin importar cuántos eslabones tenga la cadena.
type Res = { data: unknown; error: unknown };
let result: Res = { data: [], error: null };

type Chain = {
  select: () => Chain; eq: () => Chain; gte: () => Chain; lte: () => Chain; order: () => Chain;
  then: (resolve: (v: Res) => void) => void;
};
const chain: Chain = {
  select: () => chain, eq: () => chain, gte: () => chain, lte: () => chain, order: () => chain,
  then: (resolve) => resolve(result),
};
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ from: () => chain })) }));

import { getCargasDelDia, getCargasEnRango } from "@/lib/cambio/cargas-datos";

const filaEjemplo = {
  id: "c1", fecha: "2026-07-31", runner_id: "r1", origen: "bancaria", source_id: "b1",
  titular: "Ana", etiqueta: "Bancaria", pesos_cargados: "100", usd_comprados: "10", usd_retirados: "9",
};
const cargaEsperada = {
  id: "c1", fecha: "2026-07-31", runnerId: "r1", origen: "bancaria", sourceId: "b1",
  titular: "Ana", etiqueta: "Bancaria", pesosCargados: 100, usdComprados: 10, usdRetirados: 9,
};

beforeEach(() => { result = { data: [], error: null }; });

describe("getCargasDelDia", () => {
  it("mapea snake→camel", async () => {
    result = { data: [filaEjemplo], error: null };
    expect((await getCargasDelDia("2026-07-31"))[0]).toEqual(cargaEsperada);
  });
  it("sin datos da lista vacía", async () => {
    result = { data: null, error: null };
    expect(await getCargasDelDia("2026-07-31")).toEqual([]);
  });
});

describe("getCargasEnRango", () => {
  it("mapea snake→camel las cargas del rango", async () => {
    result = { data: [filaEjemplo], error: null };
    expect((await getCargasEnRango("2026-07-01", "2026-07-31"))[0]).toEqual(cargaEsperada);
  });
  it("con error devuelve lista vacía", async () => {
    result = { data: null, error: { message: "boom", details: "" } };
    expect(await getCargasEnRango("2026-07-01", "2026-07-31")).toEqual([]);
  });
});
