import { describe, it, expect } from "vitest";
import {
  accessTier,
  isAllowed,
  canAccessPath,
  landingPath,
  FULL_ACCESS,
  CAMBIO_ONLY,
  CAMBIO_RUNNERS,
  parseEmailList,
} from "@/lib/auth-config";

describe("parseEmailList", () => {
  it("sin variable definida devuelve lista vacía (deploy cambio queda cambio-only)", () => {
    expect(parseEmailList(undefined)).toEqual([]);
    expect(parseEmailList("")).toEqual([]);
  });

  it("separa por coma, recorta espacios y baja a minúsculas", () => {
    expect(parseEmailList("Fabricio@Gestionesma.store , socio@x.com")).toEqual([
      "fabricio@gestionesma.store",
      "socio@x.com",
    ]);
  });

  it("descarta entradas vacías por comas de más", () => {
    expect(parseEmailList("a@x.com,,b@y.com,")).toEqual(["a@x.com", "b@y.com"]);
  });
});

// accessTier/isAllowed dependen de las listas reales de auth-config, que
// cambian según a quién se le dio acceso. Para no acoplar el test a emails
// concretos, se toman de las propias listas y los casos de un tier se saltean
// si esa lista está vacía. canAccessPath y landingPath reciben el tier ya
// resuelto y no dependen de las listas, así que se prueban exhaustivamente.
const emailFull = FULL_ACCESS[0];
const emailCambio = CAMBIO_ONLY[0];
const itFull = emailFull ? it : it.skip;
const itCambio = emailCambio ? it : it.skip;

describe("accessTier", () => {
  itFull("un email de FULL_ACCESS da 'full'", () => {
    expect(accessTier(emailFull)).toBe("full");
  });

  itFull("un email de FULL_ACCESS en mayúsculas también da 'full' (case-insensitive)", () => {
    expect(accessTier(emailFull.toUpperCase())).toBe("full");
  });

  itCambio("un email de CAMBIO_ONLY da 'cambio'", () => {
    expect(accessTier(emailCambio)).toBe("cambio");
  });

  itCambio("un email de CAMBIO_ONLY en mayúsculas también da 'cambio' (case-insensitive)", () => {
    expect(accessTier(emailCambio.toUpperCase())).toBe("cambio");
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
  itFull("un email de acceso completo está permitido", () => {
    expect(isAllowed(emailFull)).toBe(true);
  });

  itCambio("un email de solo-caja está permitido", () => {
    expect(isAllowed(emailCambio)).toBe(true);
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

const emailRunner = CAMBIO_RUNNERS[0];
const itRunner = emailRunner ? it : it.skip;

describe("accessTier — runner", () => {
  itRunner("un email de CAMBIO_RUNNERS da 'runner'", () => {
    expect(accessTier(emailRunner)).toBe("runner");
  });
  itRunner("case-insensitive: en mayúsculas también da 'runner'", () => {
    expect(accessTier(emailRunner.toUpperCase())).toBe("runner");
  });
  itRunner("un runner está permitido (isAllowed)", () => {
    expect(isAllowed(emailRunner)).toBe(true);
  });
});

describe("canAccessPath — tier 'runner'", () => {
  it("ve /panel", () => {
    expect(canAccessPath("runner", "/panel")).toBe(true);
  });
  it("ve /panel/celulares (subruta)", () => {
    expect(canAccessPath("runner", "/panel/celulares")).toBe(true);
  });
  it("NO ve /cambio", () => {
    expect(canAccessPath("runner", "/cambio")).toBe(false);
  });
  it("NO ve /dashboard", () => {
    expect(canAccessPath("runner", "/dashboard")).toBe(false);
  });
  it("NO ve /panelxx (empieza con 'panel' pero no es el panel)", () => {
    expect(canAccessPath("runner", "/panelxx")).toBe(false);
  });
});

describe("landingPath — runner", () => {
  it("'runner' aterriza en /panel", () => {
    expect(landingPath("runner")).toBe("/panel");
  });
});
