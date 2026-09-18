import { describe, expect, it } from "vitest";
import { CORDONES, LOCALIDADES, localidadEnTexto, localidadesDe } from "./matanza";

/**
 * El partido y sus cordones. Los números salen del documento del cliente y no
 * se negocian: si alguien agrega o mueve una localidad, esto tiene que avisar.
 */
describe("el partido de La Matanza", () => {
  it("tiene las 16 localidades repartidas como dice el documento", () => {
    expect(LOCALIDADES).toHaveLength(16);
    expect(localidadesDe("primero")).toHaveLength(9);
    expect(localidadesDe("segundo")).toHaveLength(4);
    expect(localidadesDe("tercero")).toHaveLength(3);
  });

  it("no repite nombres", () => {
    expect(new Set(LOCALIDADES.map((l) => l.nombre)).size).toBe(16);
  });

  it("cada cordón tiene su propio color", () => {
    expect(new Set(CORDONES.map((c) => c.color)).size).toBe(CORDONES.length);
  });

  it("cada localidad tiene coordenadas dentro del partido", () => {
    for (const l of LOCALIDADES) {
      // La Matanza entra holgada en este rectángulo; algo fuera está mal cargado.
      expect(l.lat).toBeLessThan(-34.59);
      expect(l.lat).toBeGreaterThan(-34.95);
      expect(l.lon).toBeLessThan(-58.44);
      expect(l.lon).toBeGreaterThan(-58.82);
    }
  });

  /* El partido corre de noreste a sudoeste: los cordones tienen que ordenarse. */
  it("los cordones se alejan de CABA en orden", () => {
    const centro = (cordon: "primero" | "segundo" | "tercero") => {
      const suyas = localidadesDe(cordon);
      return suyas.reduce((a, l) => a + l.lat + l.lon, 0) / suyas.length;
    };
    expect(centro("primero")).toBeGreaterThan(centro("segundo"));
    expect(centro("segundo")).toBeGreaterThan(centro("tercero"));
  });

});

describe("encontrar la localidad en una dirección", () => {
  it("la reconoce escrita de cualquier manera", () => {
    expect(localidadEnTexto("Av. Brig. Juan Manuel de Rosas 1234, San Justo")).toBe("San Justo");
    expect(localidadEnTexto("gonzalez catan al 2300")).toBe("González Catán");
    expect(localidadEnTexto("RAMOS MEJIA, Bs As")).toBe("Ramos Mejía");
  });

  it("acepta los nombres alternativos", () => {
    expect(localidadEnTexto("Villa Celina, La Matanza")).toBe("Ciudad Celina");
    expect(localidadEnTexto("Laferrere 450")).toBe("Gregorio de Laferrere");
    expect(localidadEnTexto("Villa Eduardo Madero")).toBe("Villa Madero");
  });

  /*
   * "Villa Madero" contiene "Madero" y "Ciudad Evita" empieza igual que
   * "Ciudad Celina": gana siempre el nombre más largo que coincide, si no el
   * mapa que se le muestra a la fábrica termina con comercios mal ubicados.
   */
  it("no se confunde entre localidades parecidas", () => {
    expect(localidadEnTexto("Ciudad Evita, manzana 12")).toBe("Ciudad Evita");
    expect(localidadEnTexto("Ciudad Celina 800")).toBe("Ciudad Celina");
    expect(localidadEnTexto("Lomas del Mirador 1500")).toBe("Lomas del Mirador");
  });

  it("prefiere no adivinar antes que adivinar mal", () => {
    expect(localidadEnTexto("Av. Corrientes 1234, CABA")).toBeNull();
    expect(localidadEnTexto("")).toBeNull();
    expect(localidadEnTexto("Quilmes")).toBeNull();
  });
});
