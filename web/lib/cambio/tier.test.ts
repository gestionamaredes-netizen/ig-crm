import { describe, it, expect, vi } from "vitest";
import { resolverTier } from "./tier";

// Cliente Supabase mínimo: encadena from().select().eq().maybeSingle() y
// devuelve lo que se le configure.
function sbMock(resultado: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn(async () => resultado);
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return { client: { from } as never, from, select, eq, maybeSingle };
}

describe("resolverTier", () => {
  it("respeta la lista fija sin tocar la base (email de admin conocido)", async () => {
    const m = sbMock({ data: null, error: null });
    const tier = await resolverTier(m.client, "capi@gestionesma.store", "u1");
    expect(tier).toBe("cambio");
    expect(m.from).not.toHaveBeenCalled(); // no consultó perfiles
  });

  it("un runner de la lista fija sigue siendo runner", async () => {
    const m = sbMock({ data: null, error: null });
    expect(await resolverTier(m.client, "zurdo@gestionesma.store", "u2")).toBe("runner");
    expect(m.from).not.toHaveBeenCalled();
  });

  it("email desconocido con perfil runner en la base → runner", async () => {
    const m = sbMock({ data: { rol: "runner" }, error: null });
    expect(await resolverTier(m.client, "ori@gestionesma.store", "u3")).toBe("runner");
    expect(m.from).toHaveBeenCalledWith("perfiles_cambio");
  });

  it("email desconocido con perfil admin en la base → cambio", async () => {
    const m = sbMock({ data: { rol: "admin" }, error: null });
    expect(await resolverTier(m.client, "nuevo@gestionesma.store", "u4")).toBe("cambio");
  });

  it("email desconocido sin fila en la base → none", async () => {
    const m = sbMock({ data: null, error: null });
    expect(await resolverTier(m.client, "colado@gestionesma.store", "u5")).toBe("none");
  });

  it("falla cerrado: si la lectura da error → none", async () => {
    const m = sbMock({ data: null, error: { message: "boom" } });
    expect(await resolverTier(m.client, "x@gestionesma.store", "u6")).toBe("none");
  });

  it("sin userId no consulta y da none", async () => {
    const m = sbMock({ data: { rol: "admin" }, error: null });
    expect(await resolverTier(m.client, "x@gestionesma.store", null)).toBe("none");
    expect(m.from).not.toHaveBeenCalled();
  });
});
