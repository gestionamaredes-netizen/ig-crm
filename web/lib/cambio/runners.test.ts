import { describe, it, expect } from "vitest";
import { calcularRunners, type Runner, type Gestion, type PagoRunner } from "./runners";

const runner = (id: string, nombre: string, activo = true): Runner => ({ id, nombre, activo });
const gestion = (runnerId: string, pago: number): Gestion => ({
  id: crypto.randomUUID(), fecha: "2026-07-23", runnerId, cuentaId: "c1", cuenta: "Casa de cambio",
  tipo: "retiro", monto: 0, pago, notas: "",
});
const pago = (runnerId: string, monto: number): PagoRunner => ({
  id: crypto.randomUUID(), fecha: "2026-07-23", runnerId, monto, notas: "",
});

describe("calcularRunners", () => {
  it("suma el fee de las gestiones como gestionado", () => {
    const [s] = calcularRunners([runner("r1", "Owen")], [gestion("r1", 1000), gestion("r1", 500)], []);
    expect(s.gestionado).toBe(1500);
    expect(s.pagado).toBe(0);
    expect(s.pendiente).toBe(1500);
  });

  it("resta los pagos: pendiente = gestionado - pagado", () => {
    const [s] = calcularRunners([runner("r1", "Owen")], [gestion("r1", 1000)], [pago("r1", 400)]);
    expect(s.pendiente).toBe(600);
  });

  it("separa por runner", () => {
    const res = calcularRunners(
      [runner("r1", "Owen"), runner("r2", "Zurdo")],
      [gestion("r1", 1000), gestion("r2", 300)],
      [pago("r1", 1000)],
    );
    const owen = res.find((r) => r.id === "r1")!;
    const zurdo = res.find((r) => r.id === "r2")!;
    expect(owen.pendiente).toBe(0);
    expect(zurdo.pendiente).toBe(300);
  });

  it("un runner sin gestiones ni pagos queda en cero", () => {
    const [s] = calcularRunners([runner("r1", "Owen")], [], []);
    expect(s).toMatchObject({ gestionado: 0, pagado: 0, pendiente: 0 });
  });

  it("ignora gestiones/pagos de runners que no están en la lista", () => {
    const res = calcularRunners([runner("r1", "Owen")], [gestion("rX", 999)], [pago("rX", 999)]);
    expect(res).toHaveLength(1);
    expect(res[0].pendiente).toBe(0);
  });
});
