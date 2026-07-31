import { describe, it, expect, vi, beforeEach } from "vitest";

// Mismo patrón que celulares-datos.test.ts (fromMock/createClientMock vía
// vi.fn) sumado al mock de auth.getUser() que usa auth-guard.test.ts, porque
// getMiPerfil necesita ambos: el usuario logueado y la fila de su perfil.
const mockSingle = vi.fn();
const selectMock = vi.fn();
const eqMock = vi.fn();
const fromMock = vi.fn((tabla: string) => ({
  select: (...args: unknown[]) => (
    selectMock(tabla, ...args),
    { eq: (...eqArgs: unknown[]) => (eqMock(...eqArgs), { maybeSingle: mockSingle }) }
  ),
}));
const getUserMock = vi.fn(async () => ({ data: { user: { id: "u1" } } }));
const createClientMock = vi.fn(async () => ({ from: fromMock, auth: { getUser: getUserMock } }));

vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClientMock() }));

import { getMiPerfil } from "@/lib/cambio/perfiles-datos";

beforeEach(() => {
  vi.clearAllMocks();
  getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
});

describe("getMiPerfil", () => {
  it("mapea un runner con su nombre (snake→camel)", async () => {
    mockSingle.mockResolvedValue({
      data: { rol: "runner", runner_id: "r1", runners: { name: "Zurdo" } },
      error: null,
    });
    expect(await getMiPerfil()).toEqual({ rol: "runner", runnerId: "r1", runnerNombre: "Zurdo" });
  });

  it("un admin no tiene runner (runnerId null, nombre vacío)", async () => {
    mockSingle.mockResolvedValue({
      data: { rol: "admin", runner_id: null, runners: null },
      error: null,
    });
    expect(await getMiPerfil()).toEqual({ rol: "admin", runnerId: null, runnerNombre: "" });
  });

  it("sin fila devuelve null", async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });
    expect(await getMiPerfil()).toBeNull();
  });
});
