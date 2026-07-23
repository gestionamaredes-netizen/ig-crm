import { describe, it, expect, vi, beforeEach } from "vitest";

// Cadena de Supabase mockeada. Hay TRES caminos:
//  - companies: select().ilike().limit().single()  → resuelve el company_id
//  - alta:      insert().select().single()          → devuelve el contacto nuevo
//  - baja:      update().eq()                        → activa/desactiva
// singleMock controla el insert; companiesSingle, la resolución de empresa.
const singleMock = vi.fn();
const companiesSingle = vi.fn(async () => ({ data: { id: "empresa-1" }, error: null }));
const insertMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
// Sin tipado explícito el retorno inicial fija el tipo del mock y los tests
// de fallo no pueden devolver un `error` no nulo (mismo motivo que en
// actions.test.ts para singleMock).
const eqMock = vi.fn();
const updateMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn((tabla: string) => {
  if (tabla === "companies") {
    return { select: () => ({ ilike: () => ({ limit: () => ({ single: companiesSingle }) }) }) };
  }
  return { insert: insertMock, update: updateMock };
});
const createClientMock = vi.fn(async () => ({ from: fromMock }));

vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClientMock() }));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePathMock(p) }));

import { createExchangeClient, createExchangePerson, setContactoActivo } from "./contactos-actions";

beforeEach(() => {
  vi.clearAllMocks();
  singleMock.mockResolvedValue({ data: { id: "nuevo-1", name: "Juan Perez" }, error: null });
  eqMock.mockResolvedValue({ error: null });
});

describe("createExchangeClient", () => {
  it("da de alta y devuelve el id y el nombre", async () => {
    const r = await createExchangeClient("Juan Perez");
    expect(r).toEqual({ ok: true, id: "nuevo-1", nombre: "Juan Perez" });
    expect(fromMock).toHaveBeenCalledWith("exchange_clients");
  });

  it("recorta el nombre antes de guardar", async () => {
    await createExchangeClient("  Juan Perez  ");
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ name: "Juan Perez" }));
  });

  it("rechaza un nombre vacío sin tocar la base", async () => {
    const r = await createExchangeClient("   ");
    expect(r).toEqual({ ok: false, error: "El nombre no puede estar vacío." });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("avisa cuando el nombre ya existe (choca el índice único)", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "23505", message: "duplicate", details: "" } });
    const r = await createExchangeClient("Juan Perez");
    expect(r).toEqual({ ok: false, error: "Ya existe un contacto con ese nombre." });
  });

  it("informa un fallo genérico si el insert falla por otra causa", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "XXXXX", message: "boom", details: "" } });
    const r = await createExchangeClient("Juan Perez");
    expect(r).toEqual({ ok: false, error: "No se pudo guardar. Probá de nuevo." });
  });
});

describe("createExchangePerson", () => {
  it("da de alta en la tabla de personas", async () => {
    singleMock.mockResolvedValue({ data: { id: "p1", name: "Ana" }, error: null });
    const r = await createExchangePerson("Ana");
    expect(r).toEqual({ ok: true, id: "p1", nombre: "Ana" });
    expect(fromMock).toHaveBeenCalledWith("exchange_people");
  });
});

describe("setContactoActivo", () => {
  it("desactiva un cliente", async () => {
    const r = await setContactoActivo("cliente", "c1", false);
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("exchange_clients");
    expect(updateMock).toHaveBeenCalledWith({ active: false });
    expect(eqMock).toHaveBeenCalledWith("id", "c1");
  });

  it("reactiva una persona", async () => {
    const r = await setContactoActivo("persona", "p1", true);
    expect(r).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("exchange_people");
    expect(updateMock).toHaveBeenCalledWith({ active: true });
  });

  it("informa el fallo si el update falla", async () => {
    eqMock.mockResolvedValue({ error: { message: "rls", details: "" } });
    const r = await setContactoActivo("cliente", "c1", false);
    expect(r).toEqual({ ok: false, error: "No se pudo actualizar. Probá de nuevo." });
  });
});
