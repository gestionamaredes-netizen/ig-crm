import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// createClient de Supabase abre una conexión real y lee cookies de next/headers;
// en un test unitario se reemplaza por un mock que expone la misma forma
// (`auth.getUser()`) para poder controlar qué usuario "hay logueado".
const getUserMock = vi.fn();
const createClientMock = vi.fn(async () => ({ auth: { getUser: getUserMock } }));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClientMock() }));

// Importado después del vi.mock.
import { tieneAccesoCompleto } from "./auth-guard";

const ENV_ORIGINAL = process.env.NEXT_PUBLIC_AUTH_ENABLED;
const NODE_ORIGINAL = process.env.NODE_ENV;

function conUsuario(email: string | null) {
  getUserMock.mockResolvedValue({ data: { user: email ? { email } : null } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  process.env.NEXT_PUBLIC_AUTH_ENABLED = ENV_ORIGINAL;
  // NODE_ENV es de solo lectura en el tipado; se restaura por asignación directa.
  (process.env as Record<string, string | undefined>).NODE_ENV = NODE_ORIGINAL;
});

describe("tieneAccesoCompleto", () => {
  describe("con el login apagado (dev local)", () => {
    it("deja pasar a todos sin siquiera mirar la sesión", async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      process.env.NEXT_PUBLIC_AUTH_ENABLED = "false";
      expect(await tieneAccesoCompleto()).toBe(true);
      // Ni se molesta en abrir el cliente de Supabase.
      expect(createClientMock).not.toHaveBeenCalled();
    });
  });

  describe("con el login prendido", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_AUTH_ENABLED = "true";
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    });

    it("acepta a un usuario con acceso completo", async () => {
      conUsuario("gestionama.redes@gmail.com");
      expect(await tieneAccesoCompleto()).toBe(true);
    });

    it("RECHAZA a un usuario del tier cambio: no puede mutar datos de otras secciones", async () => {
      conUsuario("ortegafaben@gmail.com");
      expect(await tieneAccesoCompleto()).toBe(false);
    });

    it("rechaza a un email no autorizado", async () => {
      conUsuario("cualquiera@gmail.com");
      expect(await tieneAccesoCompleto()).toBe(false);
    });

    it("rechaza cuando no hay sesión", async () => {
      conUsuario(null);
      expect(await tieneAccesoCompleto()).toBe(false);
    });
  });

  describe("blindaje de producción (fail-closed)", () => {
    it("con la env var faltante en producción, exige login igual y rechaza al no autorizado", async () => {
      // El caso peligroso: si NEXT_PUBLIC_AUTH_ENABLED no llega al deploy, la
      // app NO tiene que quedar abierta. authEnabled() la trata como prendida
      // en producción, así que el guard evalúa la sesión en vez de dejar pasar.
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.NEXT_PUBLIC_AUTH_ENABLED;
      conUsuario("cualquiera@gmail.com");
      expect(await tieneAccesoCompleto()).toBe(false);
      expect(createClientMock).toHaveBeenCalled();
    });

    it("en producción sigue aceptando al usuario full", async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.NEXT_PUBLIC_AUTH_ENABLED;
      conUsuario("gestionesma.consultora@gmail.com");
      expect(await tieneAccesoCompleto()).toBe(true);
    });
  });
});
