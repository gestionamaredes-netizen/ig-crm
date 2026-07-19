import { describe, it, expect } from "vitest";
import { distanciaMetros, puntosDeBarrido, type Coordenada } from "@/lib/seo-local/geo";

const GORRITI_A: Coordenada = { lat: -34.60208108, lng: -58.86292683 };
const GORRITI_B: Coordenada = { lat: -34.60989714, lng: -58.86890736 };

describe("distanciaMetros", () => {
  it("mide el tramo de Gorriti en ~1030 metros", () => {
    expect(distanciaMetros(GORRITI_A, GORRITI_B)).toBeCloseTo(1030, -2);
  });

  it("da 0 entre un punto y sí mismo", () => {
    expect(distanciaMetros(GORRITI_A, GORRITI_A)).toBe(0);
  });
});

describe("puntosDeBarrido", () => {
  it("genera 3 puntos para el tramo de Gorriti con radio 350", () => {
    const puntos = puntosDeBarrido(GORRITI_A, GORRITI_B, 350);
    expect(puntos).toHaveLength(3);
    expect(puntos[0].lat).toBeCloseTo(-34.603384, 5);
    expect(puntos[0].lng).toBeCloseTo(-58.863924, 5);
    expect(puntos[1].lat).toBeCloseTo(-34.605989, 5);
    expect(puntos[1].lng).toBeCloseTo(-58.865917, 5);
    expect(puntos[2].lat).toBeCloseTo(-34.608594, 5);
    expect(puntos[2].lng).toBeCloseTo(-58.867911, 5);
  });

  it("nunca genera menos de 2 puntos, aunque el tramo sea corto", () => {
    const cerca: Coordenada = { lat: -34.60208108, lng: -58.86292683 };
    const casiIgual: Coordenada = { lat: -34.60210000, lng: -58.86293000 };
    expect(puntosDeBarrido(cerca, casiIgual, 350)).toHaveLength(2);
  });

  it("cubre el tramo entero: ningún extremo queda fuera del radio de su círculo", () => {
    const puntos = puntosDeBarrido(GORRITI_A, GORRITI_B, 350);
    expect(distanciaMetros(GORRITI_A, puntos[0])).toBeLessThanOrEqual(350);
    expect(distanciaMetros(GORRITI_B, puntos[puntos.length - 1])).toBeLessThanOrEqual(350);
  });
});
