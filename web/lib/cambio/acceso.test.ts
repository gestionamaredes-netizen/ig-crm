import { describe, it, expect } from "vitest";
import { normalizarUsuario, usuarioAEmail, validarUsuario, validarClave } from "./acceso";

describe("normalizarUsuario", () => {
  it("baja a minúsculas y saca espacios", () => {
    expect(normalizarUsuario("  Ori Perez ")).toBe("oriperez");
    expect(normalizarUsuario("ZURDO")).toBe("zurdo");
  });
});

describe("usuarioAEmail", () => {
  it("arma el email interno del dominio de la caja", () => {
    expect(usuarioAEmail("Ori")).toBe("ori@gestionesma.store");
    expect(usuarioAEmail(" Ale ")).toBe("ale@gestionesma.store");
  });
});

describe("validarUsuario", () => {
  it("acepta letras, números y puntos", () => {
    expect(validarUsuario("ori")).toBeNull();
    expect(validarUsuario(" ORI ")).toBeNull();
    expect(validarUsuario("ana.perez")).toBeNull();
    expect(validarUsuario("runner2")).toBeNull();
  });
  it("rechaza muy corto, muy largo y con símbolos", () => {
    expect(validarUsuario("a")).not.toBeNull();
    expect(validarUsuario("x".repeat(31))).not.toBeNull();
    expect(validarUsuario("ori@x")).not.toBeNull();
    expect(validarUsuario("ori#")).not.toBeNull();
  });
  it("los espacios se sacan antes de validar (no son un error)", () => {
    expect(validarUsuario("ori perez")).toBeNull(); // → "oriperez"
  });
});

describe("validarClave", () => {
  it("exige al menos 6 caracteres", () => {
    expect(validarClave("gestionma2026")).toBeNull();
    expect(validarClave("123456")).toBeNull();
    expect(validarClave("12345")).not.toBeNull();
  });
});
