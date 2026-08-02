import { describe, it, expect, vi, beforeEach } from "vitest";

const mockOrder = vi.fn();
const fromMock = vi.fn(() => ({ select: () => ({ eq: () => ({ order: mockOrder }) }) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ from: fromMock })) }));

import { getCargasDelDia } from "@/lib/cambio/cargas-datos";

beforeEach(() => vi.clearAllMocks());

describe("getCargasDelDia", () => {
  it("mapea snake→camel", async () => {
    mockOrder.mockResolvedValue({
      data: [{
        id: "c1", fecha: "2026-07-31", runner_id: "r1", origen: "bancaria", source_id: "b1",
        titular: "Ana", etiqueta: "Bancaria", pesos_cargados: "100", usd_comprados: "10", usd_retirados: "9",
      }],
      error: null,
    });
    const cargas = await getCargasDelDia("2026-07-31");
    expect(cargas[0]).toEqual({
      id: "c1", fecha: "2026-07-31", runnerId: "r1", origen: "bancaria", sourceId: "b1",
      titular: "Ana", etiqueta: "Bancaria", pesosCargados: 100, usdComprados: 10, usdRetirados: 9,
    });
  });
  it("sin datos da lista vacía", async () => {
    mockOrder.mockResolvedValue({ data: null, error: null });
    expect(await getCargasDelDia("2026-07-31")).toEqual([]);
  });
});
