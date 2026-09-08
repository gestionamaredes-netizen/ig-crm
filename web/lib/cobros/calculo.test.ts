import { describe, it, expect } from "vitest";
import { resumirCobro, acumular } from "@/lib/cobros/calculo";

describe("resumirCobro", () => {
  it("BELLAVISTA: sin costos, la ganancia es el total y se reparte 30/70", () => {
    const r = resumirCobro(100000, [], []);
    expect(r.costos).toBe(0);
    expect(r.ganancia).toBe(100000);
    expect(r.marcelo).toBe(30000);
    expect(r.fabricio).toBe(70000);
    expect(r.saldo).toBe(100000);
  });

  it("UPGRADE: resta costos de producción antes de repartir", () => {
    const r = resumirCobro(350000, [{ monto: 90000 }, { monto: 10000 }], []);
    expect(r.costos).toBe(100000);
    expect(r.ganancia).toBe(250000);
    expect(r.marcelo).toBe(75000);
    expect(r.fabricio).toBe(175000);
  });

  it("descuenta los pagos del saldo", () => {
    const r = resumirCobro(100000, [], [{ monto: 100000 }]);
    expect(r.pagado).toBe(100000);
    expect(r.saldo).toBe(0);
  });

  it("saldo parcial cuando pagó una parte", () => {
    const r = resumirCobro(350000, [], [{ monto: 200000 }]);
    expect(r.saldo).toBe(150000);
  });

  it("costos mayores al total dan ganancia negativa (pérdida), no la esconde", () => {
    const r = resumirCobro(100000, [{ monto: 130000 }], []);
    expect(r.ganancia).toBe(-30000);
    expect(r.marcelo).toBe(-9000);
    expect(r.fabricio).toBe(-21000);
  });

  it("pago mayor al total da saldo negativo (pagó de más)", () => {
    const r = resumirCobro(100000, [], [{ monto: 120000 }]);
    expect(r.saldo).toBe(-20000);
  });

  it("marcelo + fabricio siempre suman la ganancia", () => {
    const r = resumirCobro(350000, [{ monto: 100000 }], []);
    expect(r.marcelo + r.fabricio).toBeCloseTo(r.ganancia);
  });
});

describe("acumular", () => {
  it("suma los resúmenes de varios cobros de un cliente", () => {
    const a = resumirCobro(100000, [], [{ monto: 100000 }]);
    const b = resumirCobro(350000, [{ monto: 100000 }], [{ monto: 200000 }]);
    const t = acumular([a, b]);
    expect(t.total).toBe(450000);
    expect(t.costos).toBe(100000);
    expect(t.ganancia).toBe(350000);
    expect(t.marcelo).toBe(105000);
    expect(t.fabricio).toBe(245000);
    expect(t.pagado).toBe(300000);
    expect(t.saldo).toBe(150000);
  });

  it("lista vacía da todo en cero", () => {
    expect(acumular([])).toEqual({ total: 0, costos: 0, ganancia: 0, marcelo: 0, fabricio: 0, pagado: 0, saldo: 0 });
  });
});
