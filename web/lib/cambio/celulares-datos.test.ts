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

import { getCelulares, getCuentasOperativas } from "./celulares-datos";

beforeEach(() => {
  vi.clearAllMocks();
  resultados = {};
});

describe("getCelulares", () => {
  it("mapea snake_case a camelCase", async () => {
    resultados.phones = ok([
      { id: "c1", alias: "Cel 1", model: "iPhone 12", runner_id: "r1", active: true, runners: { name: "Owen" } },
    ]);
    expect(await getCelulares()).toEqual([
      { id: "c1", alias: "Cel 1", modelo: "iPhone 12", runnerId: "r1", runner: "Owen", activo: true },
    ]);
  });

  it("acepta runners como objeto", async () => {
    resultados.phones = ok([
      { id: "c1", alias: "Cel 1", model: "iPhone 12", runner_id: "r1", active: true, runners: { name: "Owen" } },
    ]);
    const [c] = await getCelulares();
    expect(c.runner).toBe("Owen");
  });

  it("acepta runners como array de uno", async () => {
    resultados.phones = ok([
      { id: "c1", alias: "Cel 1", model: "iPhone 12", runner_id: "r1", active: true, runners: [{ name: "Owen" }] },
    ]);
    const [c] = await getCelulares();
    expect(c.runner).toBe("Owen");
  });

  it("el runner queda vacío y runnerId null si la relación viene null", async () => {
    resultados.phones = ok([
      { id: "c1", alias: "Cel 1", model: "iPhone 12", runner_id: null, active: true, runners: null },
    ]);
    const [c] = await getCelulares();
    expect(c.runner).toBe("");
    expect(c.runnerId).toBeNull();
  });

  it("pide el orden por alias", async () => {
    resultados.phones = ok([]);
    await getCelulares();
    expect(chains.phones.order).toHaveBeenCalledWith("alias");
  });

  it("pide count exacto para poder detectar truncado", async () => {
    resultados.phones = ok([]);
    await getCelulares();
    expect(selectMock).toHaveBeenCalledWith("phones", expect.any(String), { count: "exact" });
  });

  it("avisa por consola si la respuesta viene truncada", async () => {
    resultados.phones = ok(
      [{ id: "c1", alias: "Cel 1", model: "iPhone 12", runner_id: "r1", active: true, runners: null }],
      5,
    );
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await getCelulares();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("TRUNCADO"));
    } finally {
      spy.mockRestore();
    }
  });

  it("avisa por consola si la lectura falla", async () => {
    resultados.phones = { data: null, error: { message: "rls", details: "" } };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const r = await getCelulares();
      expect(r).toEqual([]);
      expect(spy).toHaveBeenCalledWith("[cambio] lectura de celulares falló:", "rls", "");
    } finally {
      spy.mockRestore();
    }
  });
});

describe("getCuentasOperativas", () => {
  it("mapea snake_case a camelCase", async () => {
    resultados.phone_accounts = ok([
      {
        id: "a1",
        phone_id: "c1",
        holder_name: "Juan Perez",
        dni: "30111222",
        cbu_pesos: "000",
        alias_pesos: "juan.pesos",
        cbu_dolares: "111",
        alias_dolares: "juan.usd",
        status: "activa",
        notes: "nota",
        usuario: "juanhb",
        clave: "secreta123",
      },
    ]);
    expect(await getCuentasOperativas()).toEqual([
      {
        id: "a1",
        celularId: "c1",
        titular: "Juan Perez",
        dni: "30111222",
        cbuPesos: "000",
        aliasPesos: "juan.pesos",
        cbuDolares: "111",
        aliasDolares: "juan.usd",
        estado: "activa",
        notas: "nota",
        usuario: "juanhb",
        clave: "secreta123",
      },
    ]);
  });

  it("pide el orden por created_at", async () => {
    resultados.phone_accounts = ok([]);
    await getCuentasOperativas();
    expect(chains.phone_accounts.order).toHaveBeenCalledWith("created_at");
  });

  it("pide count exacto para poder detectar truncado", async () => {
    resultados.phone_accounts = ok([]);
    await getCuentasOperativas();
    expect(selectMock).toHaveBeenCalledWith("phone_accounts", expect.any(String), { count: "exact" });
  });

  it("avisa por consola si la respuesta viene truncada", async () => {
    resultados.phone_accounts = ok(
      [
        {
          id: "a1",
          phone_id: "c1",
          holder_name: "Juan Perez",
          dni: "30111222",
          cbu_pesos: "000",
          alias_pesos: "juan.pesos",
          cbu_dolares: "111",
          alias_dolares: "juan.usd",
          status: "activa",
          notes: "nota",
        },
      ],
      5,
    );
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await getCuentasOperativas();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("TRUNCADO"));
    } finally {
      spy.mockRestore();
    }
  });

  it("avisa por consola si la lectura falla", async () => {
    resultados.phone_accounts = { data: null, error: { message: "rls", details: "" } };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const r = await getCuentasOperativas();
      expect(r).toEqual([]);
      expect(spy).toHaveBeenCalledWith("[cambio] lectura de cuentas operativas falló:", "rls", "");
    } finally {
      spy.mockRestore();
    }
  });
});
