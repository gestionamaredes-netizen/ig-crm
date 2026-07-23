import { describe, it, expect } from "vitest";
import { accessTier, isAllowed, canAccessPath, landingPath, FULL_ACCESS } from "@/lib/auth-config";

// CAMBIO_ONLY está vacío en producción hoy (nadie tiene ese nivel todavía) y
// este test no lo modifica para no ensuciar el archivo real. Por eso
// accessTier solo se prueba acá con el único email real de FULL_ACCESS y con
// un email inventado que tiene que dar "none" (nunca puede estar en ninguna
// lista). El caso "cambio" de accessTier queda sin cobertura directa hasta
// que exista un email real en CAMBIO_ONLY; canAccessPath y landingPath, que
// reciben el tier ya resuelto y no dependen de las listas, sí se prueban
// exhaustivamente para los tres tiers, incluido "cambio".
describe("accessTier", () => {
  const emailReal = FULL_ACCESS[0];

  it("un email de FULL_ACCESS da 'full'", () => {
    expect(accessTier(emailReal)).toBe("full");
  });

  it("un email de FULL_ACCESS en mayúsculas también da 'full' (case-insensitive)", () => {
    expect(accessTier(emailReal.toUpperCase())).toBe("full");
  });

  it("un email desconocido da 'none'", () => {
    expect(accessTier("nadie-conoce-este-email@ejemplo.com")).toBe("none");
  });

  it("null da 'none'", () => {
    expect(accessTier(null)).toBe("none");
  });

  it("undefined da 'none'", () => {
    expect(accessTier(undefined)).toBe("none");
  });
});

describe("isAllowed", () => {
  it("'full' está permitido", () => {
    expect(isAllowed(FULL_ACCESS[0])).toBe(true);
  });

  it("un email desconocido ('none') no está permitido", () => {
    expect(isAllowed("nadie-conoce-este-email@ejemplo.com")).toBe(false);
  });

  it("null no está permitido", () => {
    expect(isAllowed(null)).toBe(false);
  });
});

describe("canAccessPath", () => {
  describe("tier 'full'", () => {
    it("ve /cambio", () => {
      expect(canAccessPath("full", "/cambio")).toBe(true);
    });

    it("ve /finanzas", () => {
      expect(canAccessPath("full", "/finanzas")).toBe(true);
    });

    it("ve /marketing", () => {
      expect(canAccessPath("full", "/marketing")).toBe(true);
    });

    it("ve /", () => {
      expect(canAccessPath("full", "/")).toBe(true);
    });

    it("ve cualquier ruta arbitraria", () => {
      expect(canAccessPath("full", "/empresas/nypro")).toBe(true);
    });
  });

  describe("tier 'cambio'", () => {
    it("ve /cambio", () => {
      expect(canAccessPath("cambio", "/cambio")).toBe(true);
    });

    it("ve /cambio/export (subruta)", () => {
      expect(canAccessPath("cambio", "/cambio/export")).toBe(true);
    });

    it("NO ve /finanzas", () => {
      expect(canAccessPath("cambio", "/finanzas")).toBe(false);
    });

    it("NO ve /marketing", () => {
      expect(canAccessPath("cambio", "/marketing")).toBe(false);
    });

    it("NO ve /", () => {
      expect(canAccessPath("cambio", "/")).toBe(false);
    });

    it("NO ve /cambioxx (empieza con 'cambio' pero no es la caja)", () => {
      expect(canAccessPath("cambio", "/cambioxx")).toBe(false);
    });
  });

  describe("tier 'none'", () => {
    it("no ve /cambio", () => {
      expect(canAccessPath("none", "/cambio")).toBe(false);
    });

    it("no ve /finanzas", () => {
      expect(canAccessPath("none", "/finanzas")).toBe(false);
    });

    it("no ve /", () => {
      expect(canAccessPath("none", "/")).toBe(false);
    });
  });
});

describe("landingPath", () => {
  it("'cambio' aterriza en /cambio", () => {
    expect(landingPath("cambio")).toBe("/cambio");
  });

  it("'full' aterriza en /dashboard", () => {
    expect(landingPath("full")).toBe("/dashboard");
  });

  it("'none' aterriza en /dashboard (no hay ruta especial para no autorizados)", () => {
    expect(landingPath("none")).toBe("/dashboard");
  });
});
