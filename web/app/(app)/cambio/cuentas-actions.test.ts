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

import { createCuenta, updateCuenta, deleteCuenta } from "./cuentas-actions";

function fd(overrides: Record<string, string> = {}): FormData {
  const data = new FormData();
  for (const [k, v] of Object.entries(overrides)) data.set(k, v);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  insertMock.mockResolvedValue({ error: null });
  singleMock.mockResolvedValue({ data: { id: "empresa-1" }, error: null });
  updateEq.mockResolvedValue({ error: null });
  deleteEq.mockResolvedValue({ error: null });
});

describe("createCuenta", () => {
  const base = {
    titular: "Juan Pérez",
    dni: "30111222",
    cbuPesos: "0000003100000000000001",
    aliasPesos: "juan.pesos",
    cbuDolares: "0000003100000000000002",
    aliasDolares: "juan.usd",
    notes: "cuenta principal",
  };

  it("crea una cuenta con los campos parseados", async () => {
    const r = await createCuenta(fd(base));
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("cuentas");
    expect(insertMock).toHaveBeenCalledWith({
      company_id: "empresa-1",
      titular: "Juan Pérez",
      dni: "30111222",
      cbu_pesos: "0000003100000000000001",
      alias_pesos: "juan.pesos",
      cbu_dolares: "0000003100000000000002",
      alias_dolares: "juan.usd",
      notes: "cuenta principal",
      tarjeta: false,
      runner_id: null,
    });
  });

  it("marca la cuenta como tarjeta cuando el toggle viene en 'true'", async () => {
    await createCuenta(fd({ ...base, tarjeta: "true" }));
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ tarjeta: true }));
  });

  it("guarda el runner elegido y lo deja en null cuando viene vacío", async () => {
    await createCuenta(fd({ ...base, runnerId: "runner-9" }));
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ runner_id: "runner-9" }));
    insertMock.mockClear();
    await createCuenta(fd({ ...base, runnerId: "" }));
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ runner_id: null }));
  });

  it("recorta espacios de todos los campos de texto", async () => {
    await createCuenta(
      fd({
        titular: "  Juan Pérez  ",
        dni: "  30111222  ",
        cbuPesos: "  0000003100000000000001  ",
        aliasPesos: "  juan.pesos  ",
        cbuDolares: "  0000003100000000000002  ",
        aliasDolares: "  juan.usd  ",
        notes: "  cuenta principal  ",
      }),
    );
    expect(insertMock).toHaveBeenCalledWith({
      company_id: "empresa-1",
      titular: "Juan Pérez",
      dni: "30111222",
      cbu_pesos: "0000003100000000000001",
      alias_pesos: "juan.pesos",
      cbu_dolares: "0000003100000000000002",
      alias_dolares: "juan.usd",
      notes: "cuenta principal",
      tarjeta: false,
      runner_id: null,
    });
  });

  it("acepta notas vacías", async () => {
    const r = await createCuenta(fd({ ...base, notes: "" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ notes: "" }));
  });

  it("informa el fallo cuando no se encuentra la empresa", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: null });
    const r = await createCuenta(fd(base));
    expect(r).toEqual({ ok: false, error: "No se encontró la empresa. Avisá al administrador." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("informa el fallo cuando el insert devuelve error", async () => {
    insertMock.mockResolvedValue({ error: { message: "rls", details: "" } });
    const r = await createCuenta(fd(base));
    expect(r).toEqual({ ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." });
  });

  it("informa el fallo cuando el insert rechaza la promesa", async () => {
    insertMock.mockRejectedValue(new Error("red caída"));
    const r = await createCuenta(fd(base));
    expect(r.ok).toBe(false);
  });

  it("una cuenta guardada sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    const r = await createCuenta(fd(base));
    expect(r).toEqual({ ok: true });
    expect(revalidatePathMock).toHaveBeenCalledWith("/cambio/cuentas");
  });
});

describe("updateCuenta", () => {
  const base = {
    titular: "Juan Pérez",
    dni: "30111222",
    cbuPesos: "0000003100000000000001",
    aliasPesos: "juan.pesos",
    cbuDolares: "0000003100000000000002",
    aliasDolares: "juan.usd",
    notes: "cuenta principal",
  };

  it("actualiza una cuenta por id con los campos parseados", async () => {
    const r = await updateCuenta("cuenta-1", fd(base));
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("cuentas");
    expect(updateFn).toHaveBeenCalledWith({
      titular: "Juan Pérez",
      dni: "30111222",
      cbu_pesos: "0000003100000000000001",
      alias_pesos: "juan.pesos",
      cbu_dolares: "0000003100000000000002",
      alias_dolares: "juan.usd",
      notes: "cuenta principal",
      tarjeta: false,
      runner_id: null,
    });
    expect(updateEq).toHaveBeenCalledWith("id", "cuenta-1");
  });

  it("rechaza un id vacío sin tocar la base", async () => {
    const r = await updateCuenta("", fd(base));
    expect(r.ok).toBe(false);
    expect(updateFn).not.toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalledWith("cuentas");
  });

  it("informa el fallo si el update devuelve error", async () => {
    updateEq.mockResolvedValueOnce({ error: { message: "rls", details: "" } });
    const r = await updateCuenta("cuenta-1", fd(base));
    expect(r).toEqual({ ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." });
  });

  it("la edición sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    expect(await updateCuenta("cuenta-1", fd(base))).toEqual({ ok: true });
  });
});

describe("deleteCuenta", () => {
  it("elimina una cuenta por id", async () => {
    const r = await deleteCuenta("cuenta-1");
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("cuentas");
    expect(deleteFn).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", "cuenta-1");
  });

  it("rechaza un id vacío sin tocar la base", async () => {
    const r = await deleteCuenta("");
    expect(r.ok).toBe(false);
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it("informa el fallo si el delete devuelve error", async () => {
    deleteEq.mockResolvedValueOnce({ error: { message: "rls", details: "" } });
    const r = await deleteCuenta("cuenta-1");
    expect(r).toEqual({ ok: false, error: "No se pudo eliminar la cuenta. Probá de nuevo." });
  });

  it("la eliminación sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    expect(await deleteCuenta("cuenta-1")).toEqual({ ok: true });
  });
});
