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

import { getCuentas } from "./cuentas-datos";

beforeEach(() => {
  vi.clearAllMocks();
  resultados = {};
});

describe("getCuentas", () => {
  it("mapea snake_case a camelCase", async () => {
    resultados.cuentas = ok([
      {
        id: "a1",
        titular: "Juan Perez",
        dni: "30111222",
        cbu_pesos: "000",
        alias_pesos: "juan.pesos",
        cbu_dolares: "111",
        alias_dolares: "juan.usd",
        notes: "nota",
      },
    ]);
    expect(await getCuentas()).toEqual([
      {
        id: "a1",
        titular: "Juan Perez",
        dni: "30111222",
        cbuPesos: "000",
        aliasPesos: "juan.pesos",
        cbuDolares: "111",
        aliasDolares: "juan.usd",
        notas: "nota",
      },
    ]);
  });

  it("pide el orden por titular", async () => {
    resultados.cuentas = ok([]);
    await getCuentas();
    expect(chains.cuentas.order).toHaveBeenCalledWith("titular");
  });

  it("pide count exacto para poder detectar truncado", async () => {
    resultados.cuentas = ok([]);
    await getCuentas();
    expect(selectMock).toHaveBeenCalledWith("cuentas", expect.any(String), { count: "exact" });
  });

  it("avisa por consola si la respuesta viene truncada", async () => {
    resultados.cuentas = ok(
      [
        {
          id: "a1",
          titular: "Juan Perez",
          dni: "30111222",
          cbu_pesos: "000",
          alias_pesos: "juan.pesos",
          cbu_dolares: "111",
          alias_dolares: "juan.usd",
          notes: "nota",
        },
      ],
      5,
    );
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await getCuentas();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("TRUNCADO"));
    } finally {
      spy.mockRestore();
    }
  });

  it("avisa por consola si la lectura falla", async () => {
    resultados.cuentas = { data: null, error: { message: "rls", details: "" } };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const r = await getCuentas();
      expect(r).toEqual([]);
      expect(spy).toHaveBeenCalledWith("[cambio] lectura de cuentas falló:", "rls", "");
    } finally {
      spy.mockRestore();
    }
  });
});
