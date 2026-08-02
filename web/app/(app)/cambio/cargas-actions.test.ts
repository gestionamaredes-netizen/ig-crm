import { describe, it, expect, vi, afterEach } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ from: fromMock })) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { marcarCarga, desmarcarCarga } from "@/app/(app)/cambio/cargas-actions";

describe("marcarCarga — validación", () => {
  it("rechaza sourceId vacío sin tocar la base", async () => {
    const r = await marcarCarga("operativa", "", "2026-07-31", "100", "", "");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
  it("rechaza fecha vacía", async () => {
    const r = await marcarCarga("operativa", "a1", "", "100", "", "");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
  it("rechaza cuando los tres montos son cero/vacíos", async () => {
    const r = await marcarCarga("operativa", "a1", "2026-07-31", "", "", "");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
  it("rechaza un monto con formato inválido", async () => {
    const r = await marcarCarga("operativa", "a1", "2026-07-31", "10,5,3", "", "");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
});

describe("marcarCarga — camino feliz (bancaria)", () => {
  afterEach(() => {
    fromMock.mockReset();
  });

  it("arma el snapshot desde cuentas y hace upsert en cargas", async () => {
    const singleEmpresa = vi.fn(async () => ({ data: { id: "empresa-1" }, error: null }));
    const singleCuenta = vi.fn(async () => ({ data: { titular: "Ana", runner_id: "r9" }, error: null }));
    const upsertMock = vi.fn(async () => ({ error: null }));
    fromMock.mockImplementation((tabla: string) => {
      if (tabla === "companies") {
        return { select: () => ({ ilike: () => ({ limit: () => ({ single: singleEmpresa }) }) }) };
      }
      if (tabla === "cuentas") {
        return { select: () => ({ eq: () => ({ limit: () => ({ single: singleCuenta }) }) }) };
      }
      if (tabla === "cargas") {
        return { upsert: upsertMock };
      }
      throw new Error(`tabla inesperada: ${tabla}`);
    });

    const r = await marcarCarga("bancaria", "b1", "2026-07-31", "1.000", "10", "9");

    expect(r).toEqual({ ok: true });
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        origen: "bancaria",
        source_id: "b1",
        fecha: "2026-07-31",
        runner_id: "r9",
        titular: "Ana",
        etiqueta: "Bancaria",
        pesos_cargados: 1000,
        usd_comprados: 10,
        usd_retirados: 9,
      }),
      { onConflict: "company_id,origen,source_id,fecha" },
    );
  });
});

describe("desmarcarCarga — validación", () => {
  it("rechaza id vacío sin tocar la base", async () => {
    const r = await desmarcarCarga("");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
});
