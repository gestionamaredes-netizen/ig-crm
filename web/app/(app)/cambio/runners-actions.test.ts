import { describe, it, expect, vi, beforeEach } from "vitest";

const insertMock = vi.fn();

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
  return { insert: insertMock };
});
const createClientMock = vi.fn(async () => ({ from: fromMock }));

vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClientMock() }));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePathMock(p) }));

import {
  createRunner,
  createRunnerAccount,
  createRunnerGestion,
  createRunnerPayment,
} from "./runners-actions";

function fd(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  for (const [k, v] of Object.entries(overrides)) data.set(k, v);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  insertMock.mockResolvedValue({ error: null });
  singleMock.mockResolvedValue({ data: { id: "empresa-1" }, error: null });
});

describe("createRunner", () => {
  it("crea un runner con el nombre", async () => {
    const r = await createRunner(fd({ name: "Owen" }));
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("runners");
    expect(insertMock).toHaveBeenCalledWith({ company_id: "empresa-1", name: "Owen" });
  });

  it("recorta espacios del nombre", async () => {
    await createRunner(fd({ name: "  Owen  " }));
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ name: "Owen" }));
  });

  it("rechaza un nombre vacío sin tocar la base", async () => {
    const r = await createRunner(fd({ name: "" }));
    expect(r).toEqual({ ok: false, error: "Falta el nombre." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza un nombre de solo espacios", async () => {
    const r = await createRunner(fd({ name: "   " }));
    expect(r.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("informa el fallo cuando no se encuentra la empresa", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: null });
    const r = await createRunner(fd({ name: "Owen" }));
    expect(r).toEqual({ ok: false, error: "No se encontró la empresa. Avisá al administrador." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("informa el fallo cuando el insert devuelve error", async () => {
    insertMock.mockResolvedValue({ error: { message: "rls", details: "" } });
    const r = await createRunner(fd({ name: "Owen" }));
    expect(r).toEqual({ ok: false, error: "No se pudo guardar el runner. Probá de nuevo." });
  });

  it("informa el fallo cuando el insert rechaza la promesa", async () => {
    insertMock.mockRejectedValue(new Error("red caída"));
    const r = await createRunner(fd({ name: "Owen" }));
    expect(r.ok).toBe(false);
  });

  it("un alta guardada sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    const r = await createRunner(fd({ name: "Owen" }));
    expect(r).toEqual({ ok: true });
    expect(revalidatePathMock).toHaveBeenCalledWith("/cambio/runners");
  });
});

describe("createRunnerAccount", () => {
  const base = { name: "Caja Owen", currency: "ARS", fee: "1.500" };

  it("crea una cuenta de gestión con los campos parseados", async () => {
    const r = await createRunnerAccount(fd(base));
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("runner_accounts");
    expect(insertMock).toHaveBeenCalledWith({
      company_id: "empresa-1",
      name: "Caja Owen",
      currency: "ARS",
      fee: 1500,
    });
  });

  it("rechaza un nombre vacío sin tocar la base", async () => {
    const r = await createRunnerAccount(fd({ ...base, name: "" }));
    expect(r).toEqual({ ok: false, error: "Falta el nombre." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza una moneda que no sea ARS o USD", async () => {
    const r = await createRunnerAccount(fd({ ...base, currency: "EUR" }));
    expect(r).toEqual({ ok: false, error: "La moneda no es válida." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("un fee vacío se guarda como cero, no como error", async () => {
    const r = await createRunnerAccount(fd({ ...base, fee: "" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ fee: 0 }));
  });

  it("un fee en cero se guarda ok", async () => {
    const r = await createRunnerAccount(fd({ ...base, fee: "0" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ fee: 0 }));
  });

  it("rechaza un fee mal escrito", async () => {
    const r = await createRunnerAccount(fd({ ...base, fee: "1.5oo" }));
    expect(r.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("una cuenta guardada sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    const r = await createRunnerAccount(fd(base));
    expect(r).toEqual({ ok: true });
  });
});

describe("createRunnerGestion", () => {
  const base = {
    gestionDate: "2026-07-23",
    runnerId: "runner-1",
    accountId: "cuenta-1",
    kind: "retiro",
    amount: "50.000",
    fee: "500",
    notes: "una nota",
  };

  it("crea una gestión con los campos parseados", async () => {
    const r = await createRunnerGestion(fd(base));
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("runner_gestiones");
    expect(insertMock).toHaveBeenCalledWith({
      company_id: "empresa-1",
      gestion_date: "2026-07-23",
      runner_id: "runner-1",
      account_id: "cuenta-1",
      kind: "retiro",
      amount: 50000,
      fee: 500,
      notes: "una nota",
    });
  });

  it("el monto vacío es cero, no un error", async () => {
    const r = await createRunnerGestion(fd({ ...base, amount: "" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ amount: 0 }));
  });

  it("rechaza una fecha vacía sin tocar la base", async () => {
    const r = await createRunnerGestion(fd({ ...base, gestionDate: "" }));
    expect(r).toEqual({ ok: false, error: "Falta la fecha." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza un runnerId vacío sin tocar la base", async () => {
    const r = await createRunnerGestion(fd({ ...base, runnerId: "" }));
    expect(r).toEqual({ ok: false, error: "Falta el runner." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza un accountId vacío sin tocar la base", async () => {
    const r = await createRunnerGestion(fd({ ...base, accountId: "" }));
    expect(r).toEqual({ ok: false, error: "Falta la cuenta." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza un kind que no sea retiro o transferencia", async () => {
    const r = await createRunnerGestion(fd({ ...base, kind: "regalo" }));
    expect(r).toEqual({ ok: false, error: "El tipo de gestión no es válido." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza un monto mal escrito", async () => {
    const r = await createRunnerGestion(fd({ ...base, amount: "50.0oo" }));
    expect(r.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("un fee vacío se guarda como cero, no como error", async () => {
    const r = await createRunnerGestion(fd({ ...base, fee: "" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ fee: 0 }));
  });

  it("un fee en cero se guarda ok", async () => {
    const r = await createRunnerGestion(fd({ ...base, fee: "0" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ fee: 0 }));
  });

  it("rechaza un fee mal escrito", async () => {
    const r = await createRunnerGestion(fd({ ...base, fee: "5oo" }));
    expect(r.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("acepta notas vacías", async () => {
    const r = await createRunnerGestion(fd({ ...base, notes: "" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ notes: "" }));
  });

  it("una gestión guardada sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    const r = await createRunnerGestion(fd(base));
    expect(r).toEqual({ ok: true });
  });
});

describe("createRunnerPayment", () => {
  const base = {
    paymentDate: "2026-07-23",
    runnerId: "runner-1",
    amount: "10.000",
    notes: "pago parcial",
  };

  it("crea un pago con los campos parseados", async () => {
    const r = await createRunnerPayment(fd(base));
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("runner_payments");
    expect(insertMock).toHaveBeenCalledWith({
      company_id: "empresa-1",
      payment_date: "2026-07-23",
      runner_id: "runner-1",
      amount: 10000,
      notes: "pago parcial",
    });
  });

  it("rechaza una fecha vacía sin tocar la base", async () => {
    const r = await createRunnerPayment(fd({ ...base, paymentDate: "" }));
    expect(r).toEqual({ ok: false, error: "Falta la fecha." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza un runnerId vacío sin tocar la base", async () => {
    const r = await createRunnerPayment(fd({ ...base, runnerId: "" }));
    expect(r).toEqual({ ok: false, error: "Falta el runner." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza un monto vacío", async () => {
    const r = await createRunnerPayment(fd({ ...base, amount: "" }));
    expect(r.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rechaza un monto mal escrito", async () => {
    const r = await createRunnerPayment(fd({ ...base, amount: "10.0oo" }));
    expect(r.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("informa el fallo cuando el insert devuelve error", async () => {
    insertMock.mockResolvedValue({ error: { message: "rls", details: "" } });
    const r = await createRunnerPayment(fd(base));
    expect(r).toEqual({ ok: false, error: "No se pudo guardar el pago. Probá de nuevo." });
  });

  it("un pago guardado sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    const r = await createRunnerPayment(fd(base));
    expect(r).toEqual({ ok: true });
  });
});
