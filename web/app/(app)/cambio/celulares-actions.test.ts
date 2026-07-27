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

import {
  createPhone,
  updatePhone,
  deletePhone,
  createPhoneAccount,
  updatePhoneAccount,
  deletePhoneAccount,
} from "./celulares-actions";

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

describe("createPhone", () => {
  const base = { alias: "Owen 1", model: "Samsung A54", runnerId: "runner-1" };

  it("crea un celular con los campos y el runner a cargo", async () => {
    const r = await createPhone(fd(base));
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("phones");
    expect(insertMock).toHaveBeenCalledWith({
      company_id: "empresa-1",
      alias: "Owen 1",
      model: "Samsung A54",
      runner_id: "runner-1",
      active: true,
    });
  });

  it("recorta espacios de alias y modelo", async () => {
    await createPhone(fd({ ...base, alias: "  Owen 1  ", model: "  A54  " }));
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ alias: "Owen 1", model: "A54" }),
    );
  });

  it("un runnerId vacío se guarda como null, no como error", async () => {
    const r = await createPhone(fd({ ...base, runnerId: "" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ runner_id: null }));
  });

  it("active nace en true cuando el campo no viene", async () => {
    const r = await createPhone(fd(base));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ active: true }));
  });

  it("active se guarda en false cuando viene explícito", async () => {
    const r = await createPhone(fd({ ...base, active: "false" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
  });

  it("informa el fallo cuando no se encuentra la empresa", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: null });
    const r = await createPhone(fd(base));
    expect(r).toEqual({ ok: false, error: "No se encontró la empresa. Avisá al administrador." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("informa el fallo cuando el insert devuelve error", async () => {
    insertMock.mockResolvedValue({ error: { message: "rls", details: "" } });
    const r = await createPhone(fd(base));
    expect(r).toEqual({ ok: false, error: "No se pudo guardar el celular. Probá de nuevo." });
  });

  it("informa el fallo cuando el insert rechaza la promesa", async () => {
    insertMock.mockRejectedValue(new Error("red caída"));
    const r = await createPhone(fd(base));
    expect(r.ok).toBe(false);
  });

  it("un alta guardada sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    const r = await createPhone(fd(base));
    expect(r).toEqual({ ok: true });
    expect(revalidatePathMock).toHaveBeenCalledWith("/cambio/celulares");
  });
});

describe("updatePhone", () => {
  const base = { alias: "Owen 1", model: "Samsung A54", runnerId: "runner-1" };

  it("actualiza un celular por id con los campos parseados", async () => {
    const r = await updatePhone("cel-1", fd(base));
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("phones");
    expect(updateFn).toHaveBeenCalledWith({
      alias: "Owen 1",
      model: "Samsung A54",
      runner_id: "runner-1",
      active: true,
    });
    expect(updateEq).toHaveBeenCalledWith("id", "cel-1");
  });

  it("rechaza un id vacío sin tocar la base", async () => {
    const r = await updatePhone("", fd(base));
    expect(r.ok).toBe(false);
    expect(updateFn).not.toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalledWith("phones");
  });

  it("un runnerId vacío se guarda como null", async () => {
    const r = await updatePhone("cel-1", fd({ ...base, runnerId: "" }));
    expect(r).toEqual({ ok: true });
    expect(updateFn).toHaveBeenCalledWith(expect.objectContaining({ runner_id: null }));
  });

  it("informa el fallo si el update devuelve error", async () => {
    updateEq.mockResolvedValueOnce({ error: { message: "rls", details: "" } });
    const r = await updatePhone("cel-1", fd(base));
    expect(r).toEqual({ ok: false, error: "No se pudo guardar el celular. Probá de nuevo." });
  });

  it("la edición sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    expect(await updatePhone("cel-1", fd(base))).toEqual({ ok: true });
  });
});

describe("deletePhone", () => {
  it("elimina un celular por id", async () => {
    const r = await deletePhone("cel-1");
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("phones");
    expect(deleteFn).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", "cel-1");
  });

  it("rechaza un id vacío sin tocar la base", async () => {
    const r = await deletePhone("");
    expect(r.ok).toBe(false);
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it("informa el fallo si el delete devuelve error", async () => {
    deleteEq.mockResolvedValueOnce({ error: { message: "rls", details: "" } });
    const r = await deletePhone("cel-1");
    expect(r).toEqual({ ok: false, error: "No se pudo eliminar el celular. Probá de nuevo." });
  });

  it("la eliminación sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    expect(await deletePhone("cel-1")).toEqual({ ok: true });
  });
});

describe("createPhoneAccount", () => {
  const base = {
    phoneId: "cel-1",
    holderName: "Juan Pérez",
    dni: "30111222",
    cbuPesos: "0000003100000000000001",
    aliasPesos: "juan.pesos",
    cbuDolares: "0000003100000000000002",
    aliasDolares: "juan.usd",
    status: "activa",
    notes: "cuenta principal",
  };

  it("crea una cuenta operativa con los campos parseados", async () => {
    const r = await createPhoneAccount(fd(base));
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("phone_accounts");
    expect(insertMock).toHaveBeenCalledWith({
      company_id: "empresa-1",
      phone_id: "cel-1",
      holder_name: "Juan Pérez",
      dni: "30111222",
      cbu_pesos: "0000003100000000000001",
      alias_pesos: "juan.pesos",
      cbu_dolares: "0000003100000000000002",
      alias_dolares: "juan.usd",
      status: "activa",
      notes: "cuenta principal",
    });
  });

  it("rechaza un phoneId vacío sin tocar la base", async () => {
    const r = await createPhoneAccount(fd({ ...base, phoneId: "" }));
    expect(r).toEqual({ ok: false, error: "Falta el celular." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("un status vacío cae al default 'activa'", async () => {
    const r = await createPhoneAccount(fd({ ...base, status: "" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ status: "activa" }));
  });

  it("respeta un status explícito", async () => {
    const r = await createPhoneAccount(fd({ ...base, status: "bloqueada" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ status: "bloqueada" }));
  });

  it("acepta notas vacías", async () => {
    const r = await createPhoneAccount(fd({ ...base, notes: "" }));
    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ notes: "" }));
  });

  it("informa el fallo cuando no se encuentra la empresa", async () => {
    singleMock.mockResolvedValueOnce({ data: null, error: null });
    const r = await createPhoneAccount(fd(base));
    expect(r).toEqual({ ok: false, error: "No se encontró la empresa. Avisá al administrador." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("informa el fallo cuando el insert devuelve error", async () => {
    insertMock.mockResolvedValue({ error: { message: "rls", details: "" } });
    const r = await createPhoneAccount(fd(base));
    expect(r).toEqual({ ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." });
  });

  it("una cuenta guardada sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    const r = await createPhoneAccount(fd(base));
    expect(r).toEqual({ ok: true });
    expect(revalidatePathMock).toHaveBeenCalledWith("/cambio/celulares");
  });
});

describe("updatePhoneAccount", () => {
  const base = {
    phoneId: "cel-1",
    holderName: "Juan Pérez",
    dni: "30111222",
    cbuPesos: "0000003100000000000001",
    aliasPesos: "juan.pesos",
    cbuDolares: "0000003100000000000002",
    aliasDolares: "juan.usd",
    status: "activa",
    notes: "cuenta principal",
  };

  it("actualiza una cuenta por id con los campos parseados", async () => {
    const r = await updatePhoneAccount("cuenta-1", fd(base));
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("phone_accounts");
    expect(updateFn).toHaveBeenCalledWith({
      phone_id: "cel-1",
      holder_name: "Juan Pérez",
      dni: "30111222",
      cbu_pesos: "0000003100000000000001",
      alias_pesos: "juan.pesos",
      cbu_dolares: "0000003100000000000002",
      alias_dolares: "juan.usd",
      status: "activa",
      notes: "cuenta principal",
    });
    expect(updateEq).toHaveBeenCalledWith("id", "cuenta-1");
  });

  it("rechaza un id vacío sin tocar la base", async () => {
    const r = await updatePhoneAccount("", fd(base));
    expect(r.ok).toBe(false);
    expect(updateFn).not.toHaveBeenCalled();
    expect(fromMock).not.toHaveBeenCalledWith("phone_accounts");
  });

  it("rechaza un phoneId vacío sin tocar la base, igual que el alta", async () => {
    const r = await updatePhoneAccount("cuenta-1", fd({ ...base, phoneId: "" }));
    expect(r).toEqual({ ok: false, error: "Falta el celular." });
    expect(updateFn).not.toHaveBeenCalled();
  });

  it("informa el fallo si el update devuelve error", async () => {
    updateEq.mockResolvedValueOnce({ error: { message: "rls", details: "" } });
    const r = await updatePhoneAccount("cuenta-1", fd(base));
    expect(r).toEqual({ ok: false, error: "No se pudo guardar la cuenta. Probá de nuevo." });
  });

  it("la edición sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    expect(await updatePhoneAccount("cuenta-1", fd(base))).toEqual({ ok: true });
  });
});

describe("deletePhoneAccount", () => {
  it("elimina una cuenta por id", async () => {
    const r = await deletePhoneAccount("cuenta-1");
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("phone_accounts");
    expect(deleteFn).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("id", "cuenta-1");
  });

  it("rechaza un id vacío sin tocar la base", async () => {
    const r = await deletePhoneAccount("");
    expect(r.ok).toBe(false);
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it("informa el fallo si el delete devuelve error", async () => {
    deleteEq.mockResolvedValueOnce({ error: { message: "rls", details: "" } });
    const r = await deletePhoneAccount("cuenta-1");
    expect(r).toEqual({ ok: false, error: "No se pudo eliminar la cuenta. Probá de nuevo." });
  });

  it("la eliminación sigue siendo ok aunque revalidatePath falle", async () => {
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    expect(await deletePhoneAccount("cuenta-1")).toEqual({ ok: true });
  });
});
