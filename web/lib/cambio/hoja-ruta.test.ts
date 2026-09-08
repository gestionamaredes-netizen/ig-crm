import { describe, it, expect } from "vitest";
import { textoHojaRuta } from "./hoja-ruta";
import type { Cuenta } from "./cuentas";

function cuenta(over: Partial<Cuenta>): Cuenta {
  return {
    id: "1", titular: "Ana Perez", dni: "30111222", banco: "Galicia",
    cbuPesos: "0070999530004000111222", aliasPesos: "ana.gal.pesos",
    cbuDolares: "", aliasDolares: "", notas: "", tarjeta: false,
    runnerId: "r1", runner: "Runner 1",
    usuario: "ana_login", clave: "secreta123",
    ...over,
  };
}

describe("textoHojaRuta", () => {
  it("incluye los datos operativos de cada cuenta", () => {
    const t = textoHojaRuta({ runner: "Runner 1", dia: "2026-08-25", cuentas: [cuenta({})] });
    expect(t).toContain("HOJA DE RUTA — Runner 1");
    expect(t).toContain("25/08/2026");
    expect(t).toContain("Cuentas asignadas: 1");
    expect(t).toContain("Galicia");
    expect(t).toContain("Ana Perez");
    expect(t).toContain("30111222");
    expect(t).toContain("0070999530004000111222");
    expect(t).toContain("ana.gal.pesos");
  });

  it("NUNCA incluye el usuario ni la clave de acceso", () => {
    const t = textoHojaRuta({ runner: "Runner 1", dia: "2026-08-25", cuentas: [cuenta({})] });
    expect(t).not.toContain("ana_login");
    expect(t).not.toContain("secreta123");
  });

  it("muestra siempre las 4 líneas de CBU/alias, con — cuando faltan", () => {
    const t = textoHojaRuta({ runner: "R", dia: "2026-08-25", cuentas: [cuenta({ cbuDolares: "", aliasDolares: "" })] });
    expect(t).toContain("CBU $: 0070999530004000111222");
    expect(t).toContain("Alias $: ana.gal.pesos");
    expect(t).toContain("CBU USD: —");
    expect(t).toContain("Alias USD: —");
  });

  it("maneja el runner sin cuentas asignadas", () => {
    const t = textoHojaRuta({ runner: "R", dia: "2026-08-25", cuentas: [] });
    expect(t).toContain("Cuentas asignadas: 0");
    expect(t).toContain("(sin cuentas asignadas)");
  });
});
