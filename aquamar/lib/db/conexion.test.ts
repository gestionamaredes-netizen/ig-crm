import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * El modo de conexión se decide al cargar el módulo, así que cada caso arranca
 * con el registro de módulos limpio y su propio entorno.
 */
describe("elección de base", () => {
  const entorno = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    // La conexión se cachea en globalThis para sobrevivir al recargado de Next:
    // resetModules no la borra, y sin esto un caso arrastraría el cliente del anterior.
    delete (globalThis as { __aquamarDb?: unknown }).__aquamarDb;
    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;
    delete process.env.NETLIFY;
    delete process.env.VERCEL;
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
    delete process.env.NEXT_PHASE;
  });

  afterEach(() => {
    process.env = { ...entorno };
  });

  it("en serverless sin base alojada falla en vez de perder los datos", async () => {
    process.env.NETLIFY = "true";
    await expect(import("./index")).rejects.toThrow(/TURSO_DATABASE_URL/);
  });

  it("lo mismo en Vercel", async () => {
    process.env.VERCEL = "1";
    await expect(import("./index")).rejects.toThrow(/TURSO_DATABASE_URL/);
  });

  it("lo mismo en Lambda", async () => {
    process.env.AWS_LAMBDA_FUNCTION_NAME = "aquamar";
    await expect(import("./index")).rejects.toThrow(/efímero/);
  });

  it("con base alojada no toca el disco", async () => {
    process.env.NETLIFY = "true";
    process.env.TURSO_DATABASE_URL = "libsql://inexistente-aquamar.turso.io";
    process.env.TURSO_AUTH_TOKEN = "token-de-prueba";

    // Falla al conectar con el host, no al elegir modo: eso prueba que salió por
    // la red y no intentó abrir un archivo.
    const error = await import("./index").then(
      () => null,
      (e: unknown) => e as Error,
    );
    expect(error).not.toBeNull();
    expect(error!.message).not.toMatch(/TURSO_DATABASE_URL|efímero/);
  });

  it("sin nada configurado usa el archivo local", async () => {
    const { cliente } = await import("./index");
    expect(cliente).toBeDefined();
  });

  /*
   * Estos dos casos son la razón por la que fallaban los despliegues: `next
   * build` importa este módulo para leer la configuración de cada página, y si
   * al importarlo se conecta a la base, compilar pasa a depender de que la base
   * esté al alcance del servidor que compila. Un token vencido rompía el
   * despliegue de páginas que ni siquiera consultan datos.
   */
  describe("al compilar", () => {
    beforeEach(() => {
      process.env.NEXT_PHASE = "phase-production-build";
    });

    it("no exige la base alojada aunque sea un despliegue serverless", async () => {
      process.env.NETLIFY = "true";
      const { cliente } = await import("./index");
      expect(cliente).toBeDefined();
    });

    it("no se conecta a la base configurada", async () => {
      process.env.NETLIFY = "true";
      // Un host que no existe: si intentara conectarse, esto tiraría error.
      process.env.TURSO_DATABASE_URL = "libsql://inexistente-aquamar.turso.io";
      process.env.TURSO_AUTH_TOKEN = "token-de-prueba";

      const { cliente } = await import("./index");
      expect(cliente).toBeDefined();
    });
  });
});
