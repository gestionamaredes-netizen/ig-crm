import { describe, it, expect, vi, beforeEach } from "vitest";

const insertMock = vi.fn();
const singleMock = vi.fn(async () => ({ data: { id: "empresa-1" }, error: null }));
const fromMock = vi.fn((tabla: string) => {
  if (tabla === "companies") {
    return { select: () => ({ ilike: () => ({ limit: () => ({ single: singleMock }) }) }) };
  }
  return { insert: insertMock };
});
const createClientMock = vi.fn(async () => ({ from: fromMock }));

vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClientMock() }));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePathMock(p) }));

import { createExchangeOp } from "./actions";

function fd(overrides: Record<string, string> = {}): FormData {
  const base: Record<string, string> = {
    kind: "venta",
    opDate: "2026-07-22",
    clientId: "cli-1",
    sender: "Deposito Sur SRL",
    receiver: "Carlos Ruiz",
    amount: "452.500",
    amountCurrency: "ARS",
    rate: "1520",
    arsAccountId: "ars-1",
    usdAccountId: "usd-1",
    fees: "",
    notes: "",
  };
  const data = new FormData();
  for (const [k, v] of Object.entries({ ...base, ...overrides })) data.set(k, v);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  insertMock.mockResolvedValue({ error: null });
});

describe("createExchangeOp", () => {
  it("guarda el monto tal como lo tipeó el usuario, a la argentina", async () => {
    const r = await createExchangeOp(fd());
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 452500, amount_currency: "ARS", rate: 1520, kind: "venta" }),
    );
  });

  it("no guarda los USD ni los pesos: se derivan del monto y el TC", async () => {
    await createExchangeOp(fd());
    const payload = insertMock.mock.calls[0][0];
    expect(payload).not.toHaveProperty("usd");
    expect(payload).not.toHaveProperty("ars");
  });

  it("rechaza un tipo de operación que no sea compra o venta", async () => {
    expect(await createExchangeOp(fd({ kind: "regalo" }))).toEqual({
      ok: false,
      error: "El tipo de operación no es válido.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza una moneda que no sea ARS o USD", async () => {
    expect(await createExchangeOp(fd({ amountCurrency: "EUR" }))).toEqual({
      ok: false,
      error: "La moneda del monto no es válida.",
    });
  });

  it("rechaza un TC en cero: dividiría por cero al calcular los dólares", async () => {
    const r = await createExchangeOp(fd({ rate: "0" }));
    expect(r.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza un monto mal escrito en vez de adivinar", async () => {
    const r = await createExchangeOp(fd({ amount: "452.5oo" }));
    expect(r.ok).toBe(false);
  });

  it("exige la fecha", async () => {
    expect(await createExchangeOp(fd({ opDate: "" }))).toEqual({ ok: false, error: "Falta la fecha." });
  });

  it("los costos vacíos son cero, no un error", async () => {
    await createExchangeOp(fd({ fees: "" }));
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ fees: 0 }));
  });

  it('escribir "0" en costos es cero, no un error de validación', async () => {
    // parsearMonto rechaza el cero por diseño, pero acá el cero es el caso
    // normal: la mayoría de las operaciones no tienen comisión, y el
    // formulario sugiere justamente "0" como placeholder.
    for (const cero of ["0", "0,00", "00"]) {
      insertMock.mockClear();
      const r = await createExchangeOp(fd({ fees: cero }));
      expect(r, `fees=${cero}`).toEqual({ ok: true });
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ fees: 0 }));
    }
  });

  it("sigue rechazando un costo mal escrito", async () => {
    expect(await createExchangeOp(fd({ fees: "5oo" }))).toEqual({
      ok: false,
      error: "Los costos no son un monto válido.",
    });
  });

  it("informa el fallo cuando el insert devuelve error", async () => {
    insertMock.mockResolvedValue({ error: { message: "rls", details: "" } });
    expect(await createExchangeOp(fd())).toEqual({
      ok: false,
      error: "No se pudo guardar la operación. Probá de nuevo.",
    });
  });

  it("informa el fallo cuando el insert rechaza la promesa", async () => {
    insertMock.mockRejectedValue(new Error("red caída"));
    const r = await createExchangeOp(fd());
    expect(r.ok).toBe(false);
  });

  it("una operación guardada sigue siendo ok aunque revalidatePath falle", async () => {
    // Reportar como fallida un alta ya commiteada hace que el usuario la
    // vuelva a cargar y duplique la operación.
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    expect(await createExchangeOp(fd())).toEqual({ ok: true });
  });
});
