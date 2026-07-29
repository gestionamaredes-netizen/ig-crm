import { describe, it, expect } from "vitest";
import { calcular } from "./calculo";
import { saldosDeCajas, rankingClientes, rankingPersonas, resumir, margenPorDia } from "./reportes";
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
    comprobantePath: "",
    canjeInId: "",
    canjeInMonto: 0,
    canjeOutId: "",
    canjeOutMonto: 0,
    ...over,
  };
}

describe("margenPorDia", () => {
  it("agrupa margen y comisiones por fecha, más reciente primero", () => {
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "venta", monto: 500, moneda: "USD", tc: 1500, costos: 3000 }),
      op({ fecha: "2026-07-02", tipo: "venta", monto: 200, moneda: "USD", tc: 1600, costos: 1000 }),
    ]);
    const dias = margenPorDia(ops);
    expect(dias.map((d) => d.fecha)).toEqual(["2026-07-02", "2026-07-01"]);
    const dia2 = dias.find((d) => d.fecha === "2026-07-02")!;
    // Margen = spread (sin comisiones): (500*(1500-1400)) + (200*(1600-1400)) = 50000 + 40000
    expect(dia2.margen).toBe(90000);
    expect(dia2.comisiones).toBe(4000);
    expect(dia2.operaciones).toBe(2);
    const dia1 = dias.find((d) => d.fecha === "2026-07-01")!;
    expect(dia1.margen).toBe(0);
    expect(dia1.operaciones).toBe(1);
  });
});

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

  it("una operación sin caja asignada no se imputa a ninguna", () => {
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400, cajaArsId: null, cajaUsdId: null }),
    ]);
    const s = saldosDeCajas(ops, CAJAS);
    expect(s.find((x) => x.id === "ars1")!.movimientos).toBe(0);
    expect(s.find((x) => x.id === "usd1")!.movimientos).toBe(0);
  });

  it("una carga suma dólares a su caja de USD y no toca ninguna caja de pesos", () => {
    // La carga es stock propio: entra a la caja de dólares pero no mueve
    // pesos, así que no lleva cajaArsId.
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "carga", monto: 500, moneda: "USD", tc: 1400, cajaArsId: null }),
    ]);
    const s = saldosDeCajas(ops, CAJAS);
    expect(s.find((x) => x.id === "usd1")!.movimientos).toBe(500);
    expect(s.find((x) => x.id === "ars1")!.movimientos).toBe(0);
  });

  it("una carga en pesos suma el monto a su caja de ARS y no toca ninguna caja de dólares", () => {
    // La carga en pesos es una inyección de capital propio a la caja de
    // pesos: no lleva cajaUsdId.
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "carga", monto: 500000, moneda: "ARS", tc: 0, cajaUsdId: null }),
    ]);
    const s = saldosDeCajas(ops, CAJAS);
    expect(s.find((x) => x.id === "ars1")!.movimientos).toBe(500000);
    expect(s.find((x) => x.id === "usd1")!.movimientos).toBe(0);
  });

  it("un canje sube la caja de entrada por su monto y baja la de salida por el suyo, sin tocar otras", () => {
    const ops = calcular([
      op({
        fecha: "2026-07-01", tipo: "canje", monto: 0, moneda: "USD", tc: 0,
        cajaArsId: null, cajaUsdId: null,
        canjeInId: "usd1", canjeInMonto: 300, canjeOutId: "ars1", canjeOutMonto: 400000,
      }),
    ]);
    const s = saldosDeCajas(ops, CAJAS);
    expect(s.find((x) => x.id === "usd1")!.movimientos).toBe(300);
    expect(s.find((x) => x.id === "ars1")!.movimientos).toBe(-400000);
  });

  it("un canje no cuenta como movimiento vía las ramas ARS/USD normales (cajaArsId/cajaUsdId en null)", () => {
    const ops = calcular([
      op({
        fecha: "2026-07-01", tipo: "canje", monto: 0, moneda: "USD", tc: 0,
        cajaArsId: null, cajaUsdId: null,
        canjeInId: "z", canjeInMonto: 300, canjeOutId: "ars1", canjeOutMonto: 400000,
      }),
    ]);
    const cajas: Caja[] = [...CAJAS, { id: "z", nombre: "USDT", moneda: "USD", saldoInicial: 0, ajuste: 0 }];
    const s = saldosDeCajas(ops, cajas);
    expect(s.find((x) => x.id === "usd1")!.movimientos).toBe(0);
    expect(s.find((x) => x.id === "z")!.movimientos).toBe(300);
    expect(s.find((x) => x.id === "ars1")!.movimientos).toBe(-400000);
  });
});

describe("rankingClientes", () => {
  it("atribuye el margen al cliente de la operación", () => {
    const r = rankingClientes(OPS);
    // Carlos Ruiz tiene un único lote de compra previo (1000 USD @ 1400), no
    // el promedio diluido de 1420 del ejemplo de calculo.test.ts: margen =
    // 800 × (1480 − 1400) = 64.000. Los costos ya no restan del margen del
    // cliente: van a su propio total (resumen.comisiones).
    expect(r.find((x) => x.cliente === "Carlos Ruiz")!.margen).toBe(64000);
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

  it("el TC promedio se pondera por monto, no es un promedio simple de los TC", () => {
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1000, cliente: "Ponderado SA", clienteId: "c3" }),
      op({ fecha: "2026-07-02", tipo: "compra", monto: 900, moneda: "USD", tc: 2000, cliente: "Ponderado SA", clienteId: "c3" }),
    ]);
    const fila = rankingClientes(ops).find((x) => x.cliente === "Ponderado SA")!;
    // Ponderado por monto: (100 × 1000 + 900 × 2000) / 1000 = 1900. Un
    // promedio simple de los TC sueltos, (1000 + 2000) / 2, daría 1500.
    expect(fila.tcPromedioCompra).toBe(1900);
  });

  it("una operación sin cliente cae en (sin cliente)", () => {
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400, cliente: "", clienteId: null }),
    ]);
    expect(rankingClientes(ops).find((x) => x.cliente === "(sin cliente)")).toBeDefined();
  });

  it("una carga no aparece en el ranking: no es una operación con cliente", () => {
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "carga", monto: 500, moneda: "USD", tc: 1400 }),
    ]);
    expect(rankingClientes(ops)).toEqual([]);
  });

  it("un canje no aparece en el ranking de clientes", () => {
    const ops = calcular([
      op({
        fecha: "2026-07-01", tipo: "canje", monto: 0, moneda: "USD", tc: 0,
        cajaArsId: null, cajaUsdId: null,
        canjeInId: "usd1", canjeInMonto: 300, canjeOutId: "ars1", canjeOutMonto: 400000,
      }),
    ]);
    expect(rankingClientes(ops)).toEqual([]);
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

  it("la misma persona como emisor y receptor cuenta una sola operación", () => {
    // Caso habitual: el cliente opera para sí mismo, manda los dólares y
    // recibe los pesos él. comoEmisor y comoReceptor valen 100 cada uno
    // (son roles distintos), pero volumen y operaciones no deben duplicar
    // la única operación real que hubo.
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400, emisor: "Solo Persona", receptor: "Solo Persona" }),
    ]);
    const persona = rankingPersonas(ops).find((x) => x.persona === "Solo Persona")!;
    expect(persona).toMatchObject({ comoEmisor: 100, comoReceptor: 100, volumen: 100, operaciones: 1 });
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

  it("el volumen no cuenta las cargas, pero el stock sí las refleja", () => {
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400 }),
      op({ fecha: "2026-07-02", tipo: "carga", monto: 50, moneda: "USD", tc: 1400 }),
    ]);
    const r = resumir(ops, "2026-07-15");
    expect(r.stockUsd).toBe(150);
    expect(r.volumenUsd).toBe(100);
  });

  it("el volumen no cuenta los canjes", () => {
    const ops = calcular([
      op({ fecha: "2026-07-01", tipo: "compra", monto: 100, moneda: "USD", tc: 1400 }),
      op({
        fecha: "2026-07-02", tipo: "canje", monto: 0, moneda: "USD", tc: 0,
        cajaArsId: null, cajaUsdId: null,
        canjeInId: "usd1", canjeInMonto: 300, canjeOutId: "ars1", canjeOutMonto: 400000,
      }),
    ]);
    const r = resumir(ops, "2026-07-15");
    expect(r.volumenUsd).toBe(100);
  });

  it("suma las comisiones en su propio total, separado del margen", () => {
    // OPS: compra sin costos + venta con costos: 5.000. El total de
    // comisiones no se mezcla con margenTotal.
    const r = resumir(OPS, "2026-07-15");
    expect(r.comisiones).toBe(5000);
  });

  it("comisionesDelMes solo cuenta las operaciones del mes de hoy", () => {
    const ops = calcular([
      op({ fecha: "2026-06-10", tipo: "compra", monto: 1000, moneda: "USD", tc: 1400, costos: 1000 }),
      op({ fecha: "2026-06-20", tipo: "venta", monto: 500, moneda: "USD", tc: 1500, costos: 2000 }),
      op({ fecha: "2026-07-05", tipo: "venta", monto: 100, moneda: "USD", tc: 1600, costos: 3000 }),
    ]);
    const r = resumir(ops, "2026-07-15");
    expect(r.comisiones).toBe(6000);
    expect(r.comisionesDelMes).toBe(3000);
  });
});
