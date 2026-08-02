import { describe, it, expect, vi } from "vitest";

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

describe("desmarcarCarga — validación", () => {
  it("rechaza id vacío sin tocar la base", async () => {
    const r = await desmarcarCarga("");
    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });
});
