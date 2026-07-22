import { describe, it, expect } from "vitest";
import {
  sumarPagados,
  sumarPendientes,
  sumarDelMes,
  sumarPorVencer,
  costoUnitario,
  diasHasta,
  estadoDeVencimiento,
  resumir,
} from "@/lib/finanzas/totales";
import type { Gasto } from "@/lib/finanzas/tipos";

const HOY = "2026-07-22";

function gasto(over: Partial<Gasto> = {}): Gasto {
  return {
    id: "g1",
    empresaId: null,
    empresa: "Iniciativa Global",
    empresaColor: "#7d7bf0",
    categoria: "otro",
    concepto: "Gasto",
    proveedor: "",
    referencia: "",
    monto: 1000,
    cantidad: 1,
    moneda: "ARS",
    pagadoEl: "2026-07-01",
    renuevaEl: null,
    periodo: "unico",
    origen: "manual",
    notas: "",
    ...over,
  };
}

describe("sumarPagados", () => {
  it("suma solo lo que tiene fecha de pago", () => {
    const gastos = [gasto({ monto: 100 }), gasto({ monto: 50, pagadoEl: null })];
    expect(sumarPagados(gastos)).toBe(100);
  });

  it("una lista vacía suma cero, no NaN", () => {
    expect(sumarPagados([])).toBe(0);
  });
});

describe("sumarPendientes", () => {
  it("suma solo lo que no tiene fecha de pago", () => {
    const gastos = [gasto({ monto: 100 }), gasto({ monto: 20000, pagadoEl: null })];
    expect(sumarPendientes(gastos)).toBe(20000);
  });
});

describe("sumarDelMes", () => {
  it("toma lo pagado dentro del mes en curso", () => {
    const gastos = [
      gasto({ monto: 417800, pagadoEl: "2026-07-05" }),
      gasto({ monto: 999, pagadoEl: "2026-06-30" }),
    ];
    expect(sumarDelMes(gastos, HOY)).toBe(417800);
  });

  it("el primer día del mes cuenta", () => {
    expect(sumarDelMes([gasto({ monto: 10, pagadoEl: "2026-07-01" })], HOY)).toBe(10);
  });

  it("ignora lo no pagado aunque tenga fecha de creación de este mes", () => {
    expect(sumarDelMes([gasto({ monto: 10, pagadoEl: null })], HOY)).toBe(0);
  });
});

describe("sumarPorVencer", () => {
  it("cuenta lo que renueva dentro de los 30 días", () => {
    const gastos = [
      gasto({ monto: 20000, renuevaEl: "2026-08-05" }),
      gasto({ monto: 417800, renuevaEl: "2027-07-05" }),
    ];
    expect(sumarPorVencer(gastos, HOY)).toBe(20000);
  });

  it("ignora lo que no renueva", () => {
    expect(sumarPorVencer([gasto({ renuevaEl: null })], HOY)).toBe(0);
  });

  it("un vencimiento ya pasado sigue contando: es deuda, no se evapora", () => {
    expect(sumarPorVencer([gasto({ monto: 500, renuevaEl: "2026-07-01" })], HOY)).toBe(500);
  });

  it("el día 30 exacto entra", () => {
    expect(sumarPorVencer([gasto({ monto: 7, renuevaEl: "2026-08-21" })], HOY)).toBe(7);
  });

  it("el día 31 ya no entra", () => {
    expect(sumarPorVencer([gasto({ monto: 7, renuevaEl: "2026-08-22" })], HOY)).toBe(0);
  });
});

describe("costoUnitario", () => {
  it("divide el total por la cantidad", () => {
    expect(costoUnitario(102000, 3)).toBe(34000);
  });

  it("devuelve null si la cantidad es cero, en vez de Infinity", () => {
    expect(costoUnitario(1000, 0)).toBeNull();
  });

  it("devuelve null si la cantidad es negativa", () => {
    expect(costoUnitario(1000, -2)).toBeNull();
  });
});

describe("diasHasta", () => {
  it("cuenta los días que faltan", () => {
    expect(diasHasta("2026-08-05", HOY)).toBe(14);
  });

  it("hoy es cero", () => {
    expect(diasHasta(HOY, HOY)).toBe(0);
  });

  it("una fecha pasada da negativo", () => {
    expect(diasHasta("2026-07-20", HOY)).toBe(-2);
  });
});

describe("estadoDeVencimiento", () => {
  it("un gasto único no vence", () => {
    expect(estadoDeVencimiento(null, HOY)).toBeNull();
  });

  it("marca en rojo lo que vence dentro de la semana", () => {
    const v = estadoDeVencimiento("2026-07-27", HOY);
    expect(v).toEqual({ tono: "rojo", etiqueta: "Vence en 5 días", dias: 5 });
  });

  it("el día 7 exacto todavía es rojo", () => {
    expect(estadoDeVencimiento("2026-07-29", HOY)?.tono).toBe("rojo");
  });

  it("el día 8 pasa a ámbar", () => {
    expect(estadoDeVencimiento("2026-07-30", HOY)?.tono).toBe("ambar");
  });

  it("el hosting a 14 días queda en ámbar", () => {
    expect(estadoDeVencimiento("2026-08-05", HOY)).toEqual({
      tono: "ambar",
      etiqueta: "Vence en 14 días",
      dias: 14,
    });
  });

  it("el día 30 exacto todavía es ámbar", () => {
    expect(estadoDeVencimiento("2026-08-21", HOY)?.tono).toBe("ambar");
  });

  it("más de 30 días queda gris", () => {
    expect(estadoDeVencimiento("2027-07-05", HOY)?.tono).toBe("gris");
  });

  it("lo vencido grita en rojo y lo dice en pasado", () => {
    expect(estadoDeVencimiento("2026-07-20", HOY)).toEqual({
      tono: "rojo",
      etiqueta: "Vencido hace 2 días",
      dias: -2,
    });
  });

  it("usa singular cuando es un solo día", () => {
    expect(estadoDeVencimiento("2026-07-23", HOY)?.etiqueta).toBe("Vence en 1 día");
  });

  it("vence hoy y lo dice sin contar días", () => {
    expect(estadoDeVencimiento(HOY, HOY)?.etiqueta).toBe("Vence hoy");
  });
});

describe("resumir", () => {
  it("el total suma gasto operativo pagado más el costo de pauta", () => {
    const gastos = [
      gasto({ monto: 417800, pagadoEl: "2026-07-05", renuevaEl: "2027-07-05" }),
      gasto({ monto: 237000, pagadoEl: "2026-07-10" }),
      gasto({ monto: 20000, pagadoEl: null, renuevaEl: "2026-08-05" }),
    ];
    expect(resumir(gastos, 0, HOY)).toEqual({
      total: 654800,
      delMes: 654800,
      porVencer: 20000,
      pendiente: 20000,
    });
  });

  it("el costo de pauta entra en el total y en el mes", () => {
    expect(resumir([], 11888, HOY)).toEqual({
      total: 11888,
      delMes: 11888,
      porVencer: 0,
      pendiente: 0,
    });
  });
});
