import { describe, it, expect, vi, beforeEach } from "vitest";

type Fila = Record<string, unknown>;
type Resultado = {
  data: Fila[] | null;
  error: { message: string; details?: string } | null;
  count?: number | null;
};

// Chain mínima: soporta uno o varios .order() encadenados y termina en
// .limit(), igual que hace el código real contra Supabase.
function chain(resultado: Resultado) {
  const self = {
    order: vi.fn(),
    limit: vi.fn(() => Promise.resolve(resultado)),
  };
  self.order.mockReturnValue(self);
  return self;
}

const ok = (data: Fila[], count?: number): Resultado => ({
  data,
  error: null,
  count: count ?? data.length,
});

let resultados: Record<string, Resultado> = {};
// Última chain devuelta por tabla, para poder inspeccionar cómo se llamó a .order().
const chains: Record<string, ReturnType<typeof chain>> = {};

const selectMock = vi.fn();
const fromMock = vi.fn((tabla: string) => {
  const q = chain(resultados[tabla] ?? ok([]));
  chains[tabla] = q;
  return { select: (...args: unknown[]) => (selectMock(tabla, ...args), q) };
});
const createClientMock = vi.fn(async () => ({ from: fromMock }));

vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClientMock() }));

import { getRunners, getCuentasGestion, getGestiones, getPagosRunner } from "./runners-datos";

beforeEach(() => {
  vi.clearAllMocks();
  resultados = {};
});

describe("getRunners", () => {
  it("mapea snake_case a camelCase", async () => {
    resultados.runners = ok([{ id: "r1", name: "Owen", active: true }]);
    expect(await getRunners()).toEqual([{ id: "r1", nombre: "Owen", activo: true }]);
  });

  it("pide el orden por nombre", async () => {
    resultados.runners = ok([]);
    await getRunners();
    expect(chains.runners.order).toHaveBeenCalledWith("name");
  });

  it("pide count exacto para poder detectar truncado", async () => {
    resultados.runners = ok([]);
    await getRunners();
    expect(selectMock).toHaveBeenCalledWith("runners", expect.any(String), { count: "exact" });
  });

  it("avisa por consola si la respuesta viene truncada", async () => {
    resultados.runners = ok([{ id: "r1", name: "Owen", active: true }], 5);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await getRunners();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("TRUNCADO"));
    } finally {
      spy.mockRestore();
    }
  });

  it("avisa por consola si la lectura falla", async () => {
    resultados.runners = { data: null, error: { message: "rls", details: "" } };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const r = await getRunners();
      expect(r).toEqual([]);
      expect(spy).toHaveBeenCalledWith("[cambio] lectura de runners falló:", "rls", "");
    } finally {
      spy.mockRestore();
    }
  });
});

describe("getCuentasGestion", () => {
  it("mapea snake_case a camelCase, con el fee numérico", async () => {
    resultados.runner_accounts = ok([
      { id: "c1", name: "Casa de cambio", currency: "USD", fee: "1500", active: true },
    ]);
    expect(await getCuentasGestion()).toEqual([
      { id: "c1", nombre: "Casa de cambio", moneda: "USD", pago: 1500, activa: true },
    ]);
  });

  it("pide el orden por nombre", async () => {
    resultados.runner_accounts = ok([]);
    await getCuentasGestion();
    expect(chains.runner_accounts.order).toHaveBeenCalledWith("name");
  });

  it("una moneda desconocida cae al default con aviso", async () => {
    resultados.runner_accounts = ok([
      { id: "c1", name: "Casa de cambio", currency: "EUR", fee: 0, active: true },
    ]);
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const [c] = await getCuentasGestion();
      expect(c.moneda).toBe("ARS");
      expect(spy).toHaveBeenCalledWith("[cambio] valor desconocido en currency:", "EUR");
    } finally {
      spy.mockRestore();
    }
  });
});

describe("getGestiones", () => {
  it("mapea snake_case a camelCase", async () => {
    resultados.runner_gestiones = ok([
      {
        id: "g1",
        gestion_date: "2026-07-20",
        runner_id: "r1",
        account_id: "c1",
        kind: "retiro",
        amount: "1000",
        fee: "500",
        notes: "nota",
        runner_accounts: { name: "Casa de cambio" },
      },
    ]);
    expect(await getGestiones()).toEqual([
      {
        id: "g1",
        fecha: "2026-07-20",
        runnerId: "r1",
        cuentaId: "c1",
        cuenta: "Casa de cambio",
        tipo: "retiro",
        monto: 1000,
        pago: 500,
        notas: "nota",
      },
    ]);
  });

  it("acepta runner_accounts como objeto", async () => {
    resultados.runner_gestiones = ok([
      {
        id: "g1",
        gestion_date: "2026-07-20",
        runner_id: "r1",
        account_id: "c1",
        kind: "retiro",
        amount: 0,
        fee: 0,
        notes: "",
        runner_accounts: { name: "Casa de cambio" },
      },
    ]);
    const [g] = await getGestiones();
    expect(g.cuenta).toBe("Casa de cambio");
  });

  it("acepta runner_accounts como array de uno", async () => {
    resultados.runner_gestiones = ok([
      {
        id: "g1",
        gestion_date: "2026-07-20",
        runner_id: "r1",
        account_id: "c1",
        kind: "retiro",
        amount: 0,
        fee: 0,
        notes: "",
        runner_accounts: [{ name: "Transferencia MP" }],
      },
    ]);
    const [g] = await getGestiones();
    expect(g.cuenta).toBe("Transferencia MP");
  });

  it("la cuenta queda vacía si la relación viene null", async () => {
    resultados.runner_gestiones = ok([
      {
        id: "g1",
        gestion_date: "2026-07-20",
        runner_id: "r1",
        account_id: "c1",
        kind: "retiro",
        amount: 0,
        fee: 0,
        notes: "",
        runner_accounts: null,
      },
    ]);
    const [g] = await getGestiones();
    expect(g.cuenta).toBe("");
  });

  it("pide el orden por gestion_date desc y created_at desc", async () => {
    resultados.runner_gestiones = ok([]);
    await getGestiones();
    expect(chains.runner_gestiones.order).toHaveBeenNthCalledWith(1, "gestion_date", { ascending: false });
    expect(chains.runner_gestiones.order).toHaveBeenNthCalledWith(2, "created_at", { ascending: false });
  });

  it("un kind desconocido cae al default con aviso", async () => {
    resultados.runner_gestiones = ok([
      {
        id: "g1",
        gestion_date: "2026-07-20",
        runner_id: "r1",
        account_id: "c1",
        kind: "regalo",
        amount: 0,
        fee: 0,
        notes: "",
        runner_accounts: null,
      },
    ]);
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const [g] = await getGestiones();
      expect(g.tipo).toBe("retiro");
      expect(spy).toHaveBeenCalledWith("[cambio] valor desconocido en kind:", "regalo");
    } finally {
      spy.mockRestore();
    }
  });
});

describe("getPagosRunner", () => {
  it("mapea snake_case a camelCase", async () => {
    resultados.runner_payments = ok([
      { id: "p1", payment_date: "2026-07-20", runner_id: "r1", amount: "2000", notes: "nota" },
    ]);
    expect(await getPagosRunner()).toEqual([
      { id: "p1", fecha: "2026-07-20", runnerId: "r1", monto: 2000, notas: "nota" },
    ]);
  });

  it("pide el orden por payment_date desc", async () => {
    resultados.runner_payments = ok([]);
    await getPagosRunner();
    expect(chains.runner_payments.order).toHaveBeenCalledWith("payment_date", { ascending: false });
  });
});
