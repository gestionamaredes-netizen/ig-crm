import { describe, it, expect } from "vitest";
import { validarComprobante, MAX_COMPROBANTE } from "./comprobantes";

describe("validarComprobante", () => {
  it("acepta una imagen JPG dentro del límite", () => {
    expect(validarComprobante({ type: "image/jpeg", size: 500_000 })).toEqual({ ok: true });
  });

  it("acepta PNG, WEBP y PDF", () => {
    for (const type of ["image/png", "image/webp", "application/pdf"]) {
      expect(validarComprobante({ type, size: 1000 }).ok, type).toBe(true);
    }
  });

  it("rechaza un tipo no permitido (ej: video)", () => {
    expect(validarComprobante({ type: "video/mp4", size: 1000 })).toEqual({
      ok: false,
      error: "Solo se aceptan imágenes (JPG, PNG, WEBP) o PDF.",
    });
  });

  it("rechaza un archivo más grande que el tope", () => {
    expect(validarComprobante({ type: "image/jpeg", size: MAX_COMPROBANTE + 1 })).toEqual({
      ok: false,
      error: "El archivo supera los 10 MB.",
    });
  });

  it("acepta exactamente el tamaño máximo", () => {
    expect(validarComprobante({ type: "application/pdf", size: MAX_COMPROBANTE })).toEqual({ ok: true });
  });
});
