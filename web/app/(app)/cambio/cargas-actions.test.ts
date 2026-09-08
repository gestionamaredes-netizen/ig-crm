import { describe, it, expect, vi, afterEach } from "vitest";

const fromMock = vi.fn();
// getUser controla qué perfil ve marcarCarga: por defecto, sin usuario (perfil
// null) → la carga conserva el runner de la cuenta. Un test lo pisa para
// simular a un runner marcando en el pool compartido.
let userMock: () => Promise<{ data: { user: { id: string } | null } }> = async () => ({ data: { user: null } });
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock, auth: { getUser: () => userMock() } })),
}));
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
    userMock = async () => ({ data: { user: null } });
  });

  // Fábrica de mock de Supabase para las tablas que toca marcarCarga. `cuenta`
  // permite variar los datos de la cuenta (banco, runner). `perfil` es lo que
  // devuelve perfiles_cambio cuando hay usuario logueado.
  function montarSupabase(opts: {
    cuenta: { titular: string; runner_id: string | null; banco?: string | null };
    perfil?: { rol: "admin" | "runner"; runner_id: string | null };
  }) {
    const upsertMock = vi.fn(async () => ({ error: null }));
    fromMock.mockImplementation((tabla: string) => {
      if (tabla === "companies") {
        return { select: () => ({ ilike: () => ({ limit: () => ({ single: async () => ({ data: { id: "empresa-1" }, error: null }) }) }) }) };
      }
      if (tabla === "cuentas") {
        return { select: () => ({ eq: () => ({ limit: () => ({ single: async () => ({ data: opts.cuenta, error: null }) }) }) }) };
      }
      if (tabla === "perfiles_cambio") {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: opts.perfil ?? null, error: null }) }) }) };
      }
      if (tabla === "cargas") {
        return { upsert: upsertMock };
      }
      throw new Error(`tabla inesperada: ${tabla}`);
    });
    return upsertMock;
  }

  it("arma el snapshot desde cuentas y hace upsert en cargas", async () => {
    const upsertMock = montarSupabase({ cuenta: { titular: "Ana", runner_id: "r9", banco: "Galicia" } });

    const r = await marcarCarga("bancaria", "b1", "2026-07-31", "1.000", "10", "9");

    expect(r).toEqual({ ok: true });
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        origen: "bancaria",
        source_id: "b1",
        fecha: "2026-07-31",
        runner_id: "r9",
        titular: "Ana",
        etiqueta: "Galicia",
        pesos_cargados: 1000,
        usd_comprados: 10,
        usd_retirados: 9,
      }),
      { onConflict: "company_id,origen,source_id,fecha" },
    );
  });

  it("en el pool compartido, atribuye la carga al runner que la marca (no al de la cuenta)", async () => {
    // La cuenta está asignada a r9, pero la marca el runner logueado r-yo.
    userMock = async () => ({ data: { user: { id: "u-yo" } } });
    const upsertMock = montarSupabase({
      cuenta: { titular: "Ana", runner_id: "r9", banco: "Brubank" },
      perfil: { rol: "runner", runner_id: "r-yo" },
    });

    const r = await marcarCarga("bancaria", "b1", "2026-07-31", "1.000", "", "");

    expect(r).toEqual({ ok: true });
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ runner_id: "r-yo", etiqueta: "Brubank" }),
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
