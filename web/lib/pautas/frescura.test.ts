import { describe, it, expect } from "vitest";
import { estadoDeFrescura } from "@/lib/pautas/frescura";

const AHORA = new Date("2026-07-21T12:00:00.000Z");
const hace = (horas: number) => new Date(AHORA.getTime() - horas * 3600_000);

describe("estadoDeFrescura", () => {
  it("una campaña en borrador no habla de actualizaciones", () => {
    expect(estadoDeFrescura(null, AHORA, "borrador")).toEqual({ etiqueta: "En borrador", tono: "neutro" });
  });

  it("una campaña activa sin datos lo dice explícitamente", () => {
    expect(estadoDeFrescura(null, AHORA, "activa")).toEqual({ etiqueta: "Sin datos cargados", tono: "neutro" });
  });

  it("muestra en gris un dato reciente", () => {
    expect(estadoDeFrescura(hace(2), AHORA, "activa")).toEqual({ etiqueta: "Actualizado hace 2 horas", tono: "gris" });
  });

  it("usa singular cuando corresponde", () => {
    expect(estadoDeFrescura(hace(1), AHORA, "activa").etiqueta).toBe("Actualizado hace 1 hora");
  });

  it("dice minutos cuando hace menos de una hora", () => {
    expect(estadoDeFrescura(new Date(AHORA.getTime() - 20 * 60_000), AHORA, "activa").etiqueta).toBe("Actualizado hace 20 minutos");
  });

  it("pasa a ámbar cuando una campaña activa lleva más de 48 horas sin datos", () => {
    expect(estadoDeFrescura(hace(72), AHORA, "activa")).toEqual({ etiqueta: "Sin actualizar hace 3 días", tono: "ambar" });
  });

  it("no alarma si la campaña está pausada", () => {
    expect(estadoDeFrescura(hace(72), AHORA, "pausada").tono).toBe("gris");
  });

  it("48 horas exactas todavía no es ámbar", () => {
    expect(estadoDeFrescura(hace(48), AHORA, "activa").tono).toBe("gris");
  });
});
