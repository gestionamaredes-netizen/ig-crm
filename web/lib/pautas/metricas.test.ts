import { describe, it, expect } from "vitest";
import {
  sumarPeriodos,
  derivar,
  seSolapan,
  periodosVigentes,
} from "@/lib/pautas/metricas";
import type { PeriodoMetrica } from "@/lib/pautas/tipos";

function periodo(p: Partial<PeriodoMetrica> = {}): PeriodoMetrica {
  return {
    id: "p1",
    campanaId: "c1",
    desde: "2026-07-20",
    hasta: "2026-07-20",
    origen: "sync",
    impresiones: 100,
    clics: 10,
    costo: 1000,
    clicsWhatsapp: 2,
    ...p,
  };
}

describe("sumarPeriodos", () => {
  it("suma tramos de distinto tamaño", () => {
    const t = sumarPeriodos([
      periodo({ id: "a", desde: "2026-07-01", hasta: "2026-07-07", origen: "manual", costo: 14000, clics: 70, impresiones: 700, clicsWhatsapp: 9 }),
      periodo({ id: "b", desde: "2026-07-08", hasta: "2026-07-08", costo: 2000, clics: 11, impresiones: 120, clicsWhatsapp: 1 }),
    ]);
    expect(t).toEqual({ impresiones: 820, clics: 81, costo: 16000, clicsWhatsapp: 10 });
  });

  it("devuelve todo en cero si no hay períodos", () => {
    expect(sumarPeriodos([])).toEqual({ impresiones: 0, clics: 0, costo: 0, clicsWhatsapp: 0 });
  });
});

describe("derivar", () => {
  it("calcula los cuatro ratios", () => {
    const d = derivar({ impresiones: 1000, clics: 50, costo: 20000, clicsWhatsapp: 10 }, 4);
    expect(d.ctr).toBeCloseTo(0.05);
    expect(d.costoPorClic).toBe(400);
    expect(d.costoPorClicWhatsapp).toBe(2000);
    expect(d.costoPorLead).toBe(5000);
  });

  it("devuelve null en vez de Infinity cuando no hay denominador", () => {
    const d = derivar({ impresiones: 0, clics: 0, costo: 5000, clicsWhatsapp: 0 }, 0);
    expect(d.ctr).toBeNull();
    expect(d.costoPorClic).toBeNull();
    expect(d.costoPorClicWhatsapp).toBeNull();
    expect(d.costoPorLead).toBeNull();
  });

  it("una campaña con gasto y cero clics no rompe", () => {
    const d = derivar({ impresiones: 900, clics: 0, costo: 3000, clicsWhatsapp: 0 }, 0);
    expect(d.ctr).toBe(0);
    expect(d.costoPorClic).toBeNull();
  });
});

describe("seSolapan", () => {
  it("detecta solapamiento parcial", () => {
    expect(seSolapan({ desde: "2026-07-20", hasta: "2026-07-26" }, { desde: "2026-07-25", hasta: "2026-07-30" })).toBe(true);
  });

  it("trata el borde como solapado porque hasta es inclusivo", () => {
    expect(seSolapan({ desde: "2026-07-20", hasta: "2026-07-26" }, { desde: "2026-07-26", hasta: "2026-07-26" })).toBe(true);
  });

  it("rangos contiguos no se solapan", () => {
    expect(seSolapan({ desde: "2026-07-20", hasta: "2026-07-26" }, { desde: "2026-07-27", hasta: "2026-07-31" })).toBe(false);
  });
});

describe("periodosVigentes", () => {
  it("descarta la fila manual que el sync ya cubre", () => {
    const manualSemana = periodo({ id: "m", desde: "2026-07-20", hasta: "2026-07-26", origen: "manual", costo: 14000, clics: 70, impresiones: 700, clicsWhatsapp: 9 });
    const sync1 = periodo({ id: "s1", desde: "2026-07-20", hasta: "2026-07-20", costo: 2000, clics: 10, impresiones: 100, clicsWhatsapp: 1 });
    const sync2 = periodo({ id: "s2", desde: "2026-07-21", hasta: "2026-07-21", costo: 2000, clics: 10, impresiones: 100, clicsWhatsapp: 1 });

    const vigentes = periodosVigentes([manualSemana, sync1, sync2]);

    expect(vigentes.map((p) => p.id).sort()).toEqual(["s1", "s2"]);
    expect(sumarPeriodos(vigentes).costo).toBe(4000);
  });

  it("conserva la fila manual que ningún sync toca", () => {
    const manualVieja = periodo({ id: "m", desde: "2026-07-01", hasta: "2026-07-07", origen: "manual" });
    const sync = periodo({ id: "s", desde: "2026-07-20", hasta: "2026-07-20" });
    expect(periodosVigentes([manualVieja, sync]).map((p) => p.id).sort()).toEqual(["m", "s"]);
  });

  it("no descarta filas de sync entre sí aunque se solapen", () => {
    const a = periodo({ id: "a", desde: "2026-07-20", hasta: "2026-07-20" });
    const b = periodo({ id: "b", desde: "2026-07-20", hasta: "2026-07-20" });
    expect(periodosVigentes([a, b])).toHaveLength(2);
  });

  // La firma es genérica sobre { desde, hasta, origen } para que lib/finanzas/
  // pueda reusar exactamente esta función en vez de copiar la regla. Estos
  // casos prueban que el comportamiento no cambió al pasar por el tipo ancho,
  // incluida la forma más liviana que finanzas realmente pasa (sin id ni
  // métricas: sólo lo que costoDePauta necesita sumar).
  describe("con la forma liviana que usa lib/finanzas (sin id ni métricas)", () => {
    type PeriodoDeGasto = { desde: string; hasta: string; origen: "manual" | "sync"; cost: number };

    it("descarta el manual que el sync ya cubre", () => {
      const manual: PeriodoDeGasto = { desde: "2026-07-20", hasta: "2026-07-26", origen: "manual", cost: 20000 };
      const sync: PeriodoDeGasto = { desde: "2026-07-20", hasta: "2026-07-26", origen: "sync", cost: 20000 };

      const vigentes = periodosVigentes([manual, sync]);

      expect(vigentes).toEqual([sync]);
      expect(vigentes.reduce((s, p) => s + p.cost, 0)).toBe(20000);
    });

    it("conserva el manual que ningún sync toca", () => {
      const manualVieja: PeriodoDeGasto = { desde: "2026-06-01", hasta: "2026-06-07", origen: "manual", cost: 5000 };
      const sync: PeriodoDeGasto = { desde: "2026-07-20", hasta: "2026-07-26", origen: "sync", cost: 20000 };

      const vigentes = periodosVigentes([manualVieja, sync]);

      expect(vigentes).toEqual([manualVieja, sync]);
      expect(vigentes.reduce((s, p) => s + p.cost, 0)).toBe(25000);
    });
  });
});
