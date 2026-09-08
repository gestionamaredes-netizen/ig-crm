import { describe, it, expect, vi, beforeEach } from "vitest";

// El módulo real de Supabase (@/lib/supabase/server) hace `cookies()` de
// next/headers y abre una conexión real: en un test unitario se reemplaza
// por un mock que expone la misma forma (`from().insert()`) para poder
// inspeccionar exactamente qué payload arma createExpense.
const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));
const createClientMock = vi.fn(async () => ({ from: fromMock }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => createClientMock(),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
}));

// Importado después de los vi.mock: createExpense usa las versiones
// mockeadas de createClient y revalidatePath.
import { createExpense } from "./actions";

function fd(overrides: Record<string, string> = {}): FormData {
  const base: Record<string, string> = {
    concept: "nyproimports.com",
    category: "dominio",
    period: "unico",
    unitAmount: "34.000",
    quantity: "3",
    companyId: "",
    vendor: "Donweb",
    externalRef: "#6138993",
    paidAt: "",
    renewsAt: "",
    notes: "",
  };
  const fields = { ...base, ...overrides };
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  insertMock.mockResolvedValue({ error: null });
});

describe("createExpense", () => {
  it("happy path: arma el payload exacto e informa éxito", async () => {
    const resultado = await createExpense(fd());

    expect(resultado).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("expenses");
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledWith({
      company_id: null,
      category: "dominio",
      concept: "nyproimports.com",
      vendor: "Donweb",
      external_ref: "#6138993",
      amount: 102000,
      quantity: 3,
      paid_at: null,
      renews_at: null,
      period: "unico",
      notes: "",
    });
  });

  it("el monto guardado es el total (unitario × cantidad), no el unitario", async () => {
    await createExpense(fd({ unitAmount: "34000", quantity: "3" }));

    const payload = insertMock.mock.calls[0][0];
    expect(payload.amount).toBe(102000);
  });

  it("un concepto vacío no inserta y devuelve su propio mensaje", async () => {
    const resultado = await createExpense(fd({ concept: "  " }));

    expect(resultado).toEqual({ ok: false, error: "Falta el concepto." });
    expect(insertMock).not.toHaveBeenCalled();
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("un monto unitario ilegible no inserta y devuelve su propio mensaje", async () => {
    const resultado = await createExpense(fd({ unitAmount: "abc" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error).toMatch(/precio unitario/);
      // El mensaje tiene que mostrar el formato esperado, con coma decimal.
      expect(resultado.error).toMatch(/,/);
    }
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("una cantidad inválida no inserta y devuelve su propio mensaje", async () => {
    const resultado = await createExpense(fd({ quantity: "abc" }));

    expect(resultado).toEqual({ ok: false, error: "La cantidad no es un número entero válido." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("una categoría fuera del set conocido no inserta y devuelve su propio mensaje", async () => {
    const resultado = await createExpense(fd({ category: "PWNED" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error).toMatch(/categor/i);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("un período fuera del set conocido no inserta y devuelve su propio mensaje", async () => {
    const resultado = await createExpense(fd({ period: "PWNED" }));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error).toMatch(/per[íi]odo/i);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("un total que supera el techo no inserta y devuelve su propio mensaje", async () => {
    // unitario y cantidad están cada uno por debajo de su propio límite
    // individual, pero el producto se va muy por encima del techo del total.
    const resultado = await createExpense(fd({ unitAmount: "999.999.999.999", quantity: "1000" }));

    expect(resultado.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("las seis validaciones devuelven mensajes distintos entre sí", async () => {
    const mensajes = new Set<string>();
    const casos: Record<string, string>[] = [
      { concept: "  " },
      { unitAmount: "abc" },
      { quantity: "abc" },
      { category: "PWNED" },
      { period: "PWNED" },
      { unitAmount: "999.999.999.999", quantity: "1000" },
    ];
    for (const overrides of casos) {
      const r = await createExpense(fd(overrides));
      if (!r.ok) mensajes.add(r.error);
    }
    expect(mensajes.size).toBe(6);
  });

  it("paidAt y renewsAt vacíos llegan al payload como null, no como cadena vacía", async () => {
    await createExpense(fd({ paidAt: "", renewsAt: "" }));

    const payload = insertMock.mock.calls[0][0];
    expect(payload.paid_at).toBeNull();
    expect(payload.renews_at).toBeNull();
  });

  it("companyId vacío llega al payload como null (gasto de la agencia)", async () => {
    await createExpense(fd({ companyId: "" }));

    const payload = insertMock.mock.calls[0][0];
    expect(payload.company_id).toBeNull();
  });

  it("si Supabase resuelve con { error }, se informa fallo y no éxito", async () => {
    insertMock.mockResolvedValueOnce({ error: { message: "constraint violada", details: "" } });

    const resultado = await createExpense(fd());

    expect(resultado.ok).toBe(false);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("si la llamada a Supabase rechaza (falla de red), se captura y no propaga", async () => {
    insertMock.mockRejectedValueOnce(new Error("fetch failed"));

    const resultado = await createExpense(fd());

    expect(resultado.ok).toBe(false);
  });

  it("si createClient() tira, se captura y no propaga", async () => {
    createClientMock.mockRejectedValueOnce(new Error("no se pudo conectar"));

    const resultado = await createExpense(fd());

    expect(resultado.ok).toBe(false);
  });

  it("un gasto ya guardado no se reporta como fallido si revalidatePath tira", async () => {
    // El insert ya commiteó: una excepción en revalidatePath no puede
    // convertir un alta exitosa en { ok: false } — el usuario reintentaría
    // y crearía un gasto duplicado.
    revalidatePathMock.mockImplementationOnce(() => {
      throw new Error("revalidate falló");
    });

    const resultado = await createExpense(fd());

    expect(resultado).toEqual({ ok: true });
  });
});
