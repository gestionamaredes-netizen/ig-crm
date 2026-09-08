import { describe, it, expect, vi, beforeEach } from "vitest";

const insertMock = vi.fn();
const updateEq = vi.fn();
const updateFn = vi.fn(() => ({ eq: updateEq }));
const deleteEq = vi.fn();
const deleteFn = vi.fn(() => ({ eq: deleteEq }));

// Tipado explícito: sin esto, TS infiere el tipo de retorno a partir del
// primer valor pasado (una empresa sin error) y después no deja que los
// tests de fallo devuelvan `data: null` o un `error` no nulo.
type ResultadoSingleEmpresa = {
  data: { id: string } | null;
  error: { message: string; details?: string } | null;
};
const singleMock = vi.fn(
  async (): Promise<ResultadoSingleEmpresa> => ({ data: { id: "empresa-1" }, error: null }),
);
const fromMock = vi.fn((tabla: string) => {
  if (tabla === "companies") {
    return { select: () => ({ ilike: () => ({ limit: () => ({ single: singleMock }) }) }) };
  }
  return { insert: insertMock, update: updateFn, delete: deleteFn };
});
const createClientMock = vi.fn(async () => ({ from: fromMock }));

vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClientMock() }));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePathMock(p) }));

import { createExchangeOp, setComprobante, updateExchangeOp, deleteExchangeOp } from "./actions";

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
    comprobantePath: "",
  };
  const data = new FormData();
  for (const [k, v] of Object.entries({ ...base, ...overrides })) data.set(k, v);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  insertMock.mockResolvedValue({ error: null });
  singleMock.mockResolvedValue({ data: { id: "empresa-1" }, error: null });
  updateEq.mockResolvedValue({ error: null });
  deleteEq.mockResolvedValue({ error: null });
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

  it("una operación normal (no canje) guarda los 4 campos de canje en su default", async () => {
    await createExchangeOp(fd());
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        canje_in_account: null,
        canje_in_amount: 0,
        canje_out_account: null,
        canje_out_amount: 0,
      }),
    );
  });

  it("un canje guarda los 4 campos de canje (con amount=0 y rate=1 como manda el form)", async () => {
    // El form del canje manda amount="0" y rate="1" (neutros): no deben ser
    // rechazados por parsearMonto, que descarta el cero.
    await createExchangeOp(
      fd({
        kind: "canje",
        amount: "0",
        rate: "1",
        canjeInAccount: "cuenta-in-1",
        canjeInMonto: "1.000,50",
        canjeOutAccount: "cuenta-out-1",
        canjeOutMonto: "2.000",
      }),
    );
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "canje",
        amount: 0,
        rate: 1,
        canje_in_account: "cuenta-in-1",
        canje_in_amount: 1000.5,
        canje_out_account: "cuenta-out-1",
        canje_out_amount: 2000,
      }),
    );
  });

  it("informa el fallo cuando no existe la empresa", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: null });
    expect(await createExchangeOp(fd())).toEqual({
      ok: false,
      error: "No se encontró la empresa. Avisá al administrador.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("informa el fallo cuando la consulta de la empresa falla", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: { message: "rls", details: "" } });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(await createExchangeOp(fd())).toEqual({
        ok: false,
        error: "No se encontró la empresa. Avisá al administrador.",
      });
      expect(insertMock).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(
        "[cambio] búsqueda de empresa falló:",
        "rls",
        "",
      );
    } finally {
      spy.mockRestore();
    }
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

describe("comprobante en el alta", () => {
  it("guarda comprobante_path cuando viene en el FormData", async () => {
    await createExchangeOp(fd({ comprobantePath: "abc-123.jpg" }));
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ comprobante_path: "abc-123.jpg" }));
  });

  it("guarda comprobante_path vacío cuando no se adjuntó nada", async () => {
    await createExchangeOp(fd());
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ comprobante_path: "" }));
  });
});

describe("setComprobante", () => {
  it("actualiza el comprobante de una operación", async () => {
    const r = await setComprobante("op-1", "nuevo.pdf");
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("exchange_ops");
    expect(updateFn).toHaveBeenCalledWith({ comprobante_path: "nuevo.pdf" });
    expect(updateEq).toHaveBeenCalledWith("id", "op-1");
  });

  it("rechaza un id vacío sin tocar la base", async () => {
    const r = await setComprobante("", "x.pdf");
    expect(r).toEqual({ ok: false, error: "Falta la operación." });
    expect(updateFn).not.toHaveBeenCalled();
  });

  it("informa el fallo si el update falla", async () => {
    updateEq.mockResolvedValueOnce({ error: { message: "rls", details: "" } });
    const r = await setComprobante("op-1", "x.pdf");
    expect(r).toEqual({ ok: false, error: "No se pudo guardar el comprobante. Probá de nuevo." });
  });
});

describe("updateExchangeOp", () => {
  it("actualiza una operación por id con los campos parseados", async () => {
    const r = await updateExchangeOp("op-1", fd());
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("exchange_ops");
    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        op_date: "2026-07-22",
        kind: "venta",
        client_id: "cli-1",
        sender: "Deposito Sur SRL",
        receiver: "Carlos Ruiz",
        amount: 452500,
        amount_currency: "ARS",
        rate: 1520,
        ars_account_id: "ars-1",
        usd_account_id: "usd-1",
        fees: 0,
        notes: "",
        comprobante_path: "",
      }),
    );
    expect(updateEq).toHaveBeenCalledWith("id", "op-1");
  });

  it("guarda kind=carga tal cual, sin forzarlo a compra/venta", async () => {
    const r = await updateExchangeOp("op-1", fd({ kind: "carga", amountCurrency: "USD" }));
    expect(r).toEqual({ ok: true });
    expect(updateFn).toHaveBeenCalledWith(expect.objectContaining({ kind: "carga" }));
  });

  it("rechaza un opId vacío sin tocar la base", async () => {
    const r = await updateExchangeOp("", fd());
    expect(r).toEqual({ ok: false, error: "Falta la operación." });
    expect(updateFn).not.toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalledWith("exchange_ops");
  });

  it("rechaza campos inválidos sin tocar la base, igual que el alta", async () => {
    const r = await updateExchangeOp("op-1", fd({ kind: "regalo" }));
    expect(r).toEqual({ ok: false, error: "El tipo de operación no es válido." });
    expect(updateFn).not.toHaveBeenCalled();
  });

  it("informa el fallo si el update devuelve error", async () => {
    updateEq.mockResolvedValueOnce({ error: { message: "rls", details: "" } });
    const r = await updateExchangeOp("op-1", fd());
    expect(r).toEqual({ ok: false, error: "No se pudo guardar la operación. Probá de nuevo." });
  });

  it("la edición sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    expect(await updateExchangeOp("op-1", fd())).toEqual({ ok: true });
  });
});

describe("deleteExchangeOp", () => {
  it("elimina una operación por id", async () => {
    const r = await deleteExchangeOp("op-1");
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("exchange_ops");
    expect(deleteFn).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", "op-1");
  });

  it("rechaza un opId vacío sin tocar la base", async () => {
    const r = await deleteExchangeOp("");
    expect(r).toEqual({ ok: false, error: "Falta la operación." });
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it("informa el fallo si el delete devuelve error", async () => {
    deleteEq.mockResolvedValueOnce({ error: { message: "rls", details: "" } });
    const r = await deleteExchangeOp("op-1");
    expect(r).toEqual({ ok: false, error: "No se pudo eliminar la operación. Probá de nuevo." });
  });

  it("la eliminación sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    expect(await deleteExchangeOp("op-1")).toEqual({ ok: true });
  });
});
