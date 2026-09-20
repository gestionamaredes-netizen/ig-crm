import "server-only";
import type { Client } from "@libsql/client";

/**
 * Una sola conexión por proceso. En dev Next recarga los módulos en cada
 * cambio: sin el cache global quedarían decenas de conexiones abiertas.
 */
const global_ = globalThis as unknown as { __prospectosDb?: Client };

const REMOTA = process.env.TURSO_DATABASE_URL;

/**
 * Serverless: ni Netlify ni Vercel tienen disco que sobreviva al pedido. Si
 * mañana se despliega en otro lado, sumar su variable acá.
 */
const SIN_DISCO = Boolean(
  process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
);

const SQL_BOOTSTRAP = `
CREATE TABLE IF NOT EXISTS seguimiento (
  prospecto_id TEXT PRIMARY KEY,
  estado TEXT NOT NULL DEFAULT 'nuevo',
  responsable TEXT NOT NULL DEFAULT 'Sin asignar',
  proxima TEXT NOT NULL DEFAULT '',
  fecha TEXT NOT NULL DEFAULT '',
  notas TEXT NOT NULL DEFAULT '',
  editado_por TEXT NOT NULL DEFAULT '',
  editado_en INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS historial (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prospecto_id TEXT NOT NULL,
  quien TEXT NOT NULL,
  campo TEXT NOT NULL,
  cuando INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS historial_prospecto_idx ON historial(prospecto_id, cuando);

CREATE TABLE IF NOT EXISTS agregados (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  rubro TEXT NOT NULL DEFAULT '',
  localidad TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  direccion TEXT NOT NULL DEFAULT '',
  telefono TEXT NOT NULL DEFAULT '',
  mail TEXT NOT NULL DEFAULT '',
  contenido TEXT NOT NULL DEFAULT '',
  cargado_por TEXT NOT NULL DEFAULT '',
  creado_en INTEGER NOT NULL
);
`;

async function abrir(): Promise<Client> {
  if (REMOTA) {
    // El cliente web habla HTTP y no arrastra binarios nativos al bundle.
    const { createClient } = await import("@libsql/client/web");
    return createClient({ url: REMOTA, authToken: process.env.TURSO_AUTH_TOKEN });
  }

  if (SIN_DISCO) {
    throw new Error(
      "Falta TURSO_DATABASE_URL. En Netlify el disco es efímero: sin una base " +
        "alojada, el seguimiento que cargue el equipo se pierde entre pedidos.",
    );
  }

  const [{ createClient }, fs, path] = await Promise.all([
    import("@libsql/client"),
    import("node:fs"),
    import("node:path"),
  ]);
  const ruta = path.resolve(process.env.DATABASE_FILE ?? "./data/prospectos.sqlite");
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  return createClient({ url: `file:${ruta}` });
}

export const db = (global_.__prospectosDb ??= await abrir());

/**
 * Crea el esquema si falta. Va en el nivel superior del módulo: cualquiera que
 * importe `db` espera a que termine, así ninguna consulta corre contra una base
 * sin tablas y no hace falta un paso de migración manual.
 */
await db.executeMultiple(SQL_BOOTSTRAP);
