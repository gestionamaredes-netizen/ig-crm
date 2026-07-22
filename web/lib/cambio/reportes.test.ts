import { describe, it, expect } from "vitest";
import { calcular } from "./calculo";
import { saldosDeCajas, rankingClientes, rankingPersonas, resumir } from "./reportes";
import type { Operacion, Caja } from "./tipos";

const CAJAS: Caja[] = [
  { id: "ars1", nombre: "Banco $", moneda: "ARS", saldoInicial: 0, ajuste: 0 },
  { id: "usd1", nombre: "Efectivo USD", moneda: "USD", saldoInicial: 0, ajuste: 0 },
];

function op(over: Partial<Operacion> & Pick<Operacion, "fecha" | "tipo" | "monto" | "moneda" | "tc">): Operacion {
  return {
    id: String(Math.random()),
    creadaEn: `${over.fecha}T10:00:00Z`,
    clienteId: "c1",
    cliente: "Juan Perez",
    emisor: "Juan Perez",
    receptor: "Ana Perez",
    cajaArsId: "ars1",
    cajaUsdId: "usd1",
    costos: 0,
    notas: "",
    ...over,
  };
}

const OPS = calcular([
  op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
  op({ fecha: "2026-07-02", tipo: "venta", monto: 800, moneda: "USD", tc: 1480, costos: 5000, cliente: "Carlos Ruiz", clienteId: "c2", emisor: "Deposito Sur", receptor: "Carlos Ruiz" }),
]);

describe("saldosDeCajas", () => {
  it("la caja de pesos baja con las compras, sube con las ventas y descuenta los costos", () => {
    const s = saldosDeCajas(OPS, CAJAS);
    // −1.400.000 de la compra, +1.184.000 de la venta, −5.000 de costos
    expect(s.find((x) => x.id === "ars1")!.saldo).toBe(-221000);
  });

  it("la caja de dólares sube con las compras y baja con las ventas", () => {
    expect(saldosDeCajas(OPS, CAJAS).find((x) => x.id === "usd1")!.saldo).toBe(200);
  });

  it("suma el saldo inicial y el ajuste manual", () => {
    const cajas: Caja[] = [{ ...CAJAS[1], saldoInicial: 50, ajuste: -3 }];
    expect(saldosDeCajas(OPS, cajas)[0].saldo).toBe(247);
  });

  it("una caja sin movimientos queda en su saldo inicial, no se omite", () => {
    const cajas: Caja[] = [{ id: "z", nombre: "USDT", moneda: "USD", saldoInicial: 10, ajuste: 0 }];
    expect(saldosDeCajas(OPS, cajas)[0]).toMatchObject({ movimientos: 0, saldo: 10 });
  });
});

describe("rankingClientes", () => {
  it("atribuye el margen al cliente de la operación", () => {
    const r = rankingClientes(OPS);
    // Carlos Ruiz tiene un único lote de compra previo (1000 USD @ 1400), no
    // el promedio diluido de 1420 del ejemplo de calculo.test.ts: margen =
    // 800 × (1480 − 1400) − 5.000 de costos = 59.000.
    expect(r.find((x) => x.cliente === "Carlos Ruiz")!.margen).toBe(59000);
    expect(r.find((x) => x.cliente === "Juan Perez")!.margen).toBe(0);
  });

  it("separa dólares comprados de vendidos y calcula el TC promedio de cada lado", () => {
    const juan = rankingClientes(OPS).find((x) => x.cliente === "Juan Perez")!;
    expect(juan.usdComprados).toBe(1000);
    expect(juan.usdVendidos).toBe(0);
    expect(juan.tcPromedioCompra).toBe(1400);
    expect(juan.tcPromedioVenta).toBe(0);
  });

  it("ordena por volumen descendente", () => {
    expect(rankingClientes(OPS).map((x) => x.cliente)).toEqual(["Juan Perez", "Carlos Ruiz"]);
  });
});

describe("rankingPersonas", () => {
  it("cuenta a cada persona como emisor y como receptor por separado", () => {
    const r = rankingPersonas(OPS);
    expect(r.find((x) => x.persona === "Ana Perez")).toMatchObject({ comoEmisor: 0, comoReceptor: 1000 });
    expect(r.find((x) => x.persona === "Juan Perez")).toMatchObject({ comoEmisor: 1000, comoReceptor: 0 });
  });

  it("agrupa ignorando mayúsculas y espacios de más", () => {
    // El usuario escribe a mano: "Ana Perez" y "ana perez " son la misma
    // persona y tienen que sumar en una sola fila.
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400, receptor: "Ana Perez" }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 100, moneda: "USD", tc: 1400, receptor: "  ana perez " }),
    ]);
    const ana = rankingPersonas(ops).filter((x) => x.persona.toLowerCase().trim() === "ana perez");
    expect(ana).toHaveLength(1);
    expect(ana[0].comoReceptor).toBe(200);
    // Conserva la primera forma que se escribió, no la última ni la normalizada.
    expect(ana[0].persona).toBe("Ana Perez");
  });

  it("ignora los nombres vacíos", () => {
    const ops = calcular([op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400, emisor: "", receptor: "" })]);
    expect(rankingPersonas(ops)).toEqual([]);
  });
});

describe("resumir", () => {
  it("toma el stock y el costo promedio de la última operación", () => {
    const r = resumir(OPS, "2026-07-15");
    expect(r.stockUsd).toBe(200);
    expect(r.costoPromedio).toBe(1400);
  });

  it("el margen del mes solo cuenta las operaciones del mes de hoy", () => {
    const ops = calcular([
      op({ fecha: "2026-06-10", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-06-20", tipo: "venta", monto: 500, moneda: "USD", tc: 1500 }),
      op({ fecha: "2026-07-05", tipo: "venta", monto: 100, moneda: "USD", tc: 1600 }),
    ]);
    const r = resumir(ops, "2026-07-15");
    expect(r.margenTotal).toBeCloseTo(50000 + 20000, 2);
    expect(r.margenDelMes).toBeCloseTo(20000, 2);
  });

  it("sin operaciones devuelve todo en cero en vez de romper", () => {
    expect(resumir([], "2026-07-15")).toMatchObject({ stockUsd: 0, costoPromedio: 0, margenTotal: 0, operaciones: 0 });
  });
});
