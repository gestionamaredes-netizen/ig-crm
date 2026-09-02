import "server-only";
import { drizzle } from "drizzle-orm/libsql";
import type { Client } from "@libsql/client";
import * as schema from "./schema";
import { COLUMNAS_AGREGADAS, SQL_BOOTSTRAP } from "./bootstrap";

/**
 * Una sola conexión por proceso. En dev, Next recarga los módulos en cada
 * cambio: sin el cache global quedarían decenas de conexiones abiertas.
 */
const global_ = globalThis as unknown as { __aquamarDb?: Client };

const REMOTA = process.env.TURSO_DATABASE_URL;

/**
 * Serverless: ni Netlify, ni Vercel, ni Lambda tienen disco que sobreviva al
 * pedido. Si mañana se despliega en otro lado, sumar su variable acá: sin este
 * aviso la app arranca contra un archivo que se borra solo.
 */
const SIN_DISCO = Boolean(
  process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
);

/**
 * La misma app corre contra una base alojada o contra un archivo local. En
 * producción serverless el archivo no sirve: cada invocación arranca con disco
 * vacío, así que sin TURSO_DATABASE_URL falla de entrada en vez de perder datos
 * en silencio.
 */
async function abrir(): Promise<Client> {
  if (REMOTA) {
    // El cliente web habla HTTP y no arrastra binarios nativos al bundle.
    const { createClient } = await import("@libsql/client/web");
    return createClient({ url: REMOTA, authToken: process.env.TURSO_AUTH_TOKEN });
  }

  if (SIN_DISCO) {
    throw new Error(
      "Falta TURSO_DATABASE_URL. En Netlify el disco es efímero: sin una base alojada, " +
        "todo lo que cargues se pierde entre pedidos.",
    );
  }

  const [{ createClient }, fs, path] = await Promise.all([
    import("@libsql/client"),
    import("node:fs"),
    import("node:path"),
  ]);
  const ruta = path.resolve(process.env.DATABASE_FILE ?? "./data/aquamar.sqlite");
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  return createClient({ url: `file:${ruta}` });
}

export const cliente = (global_.__aquamarDb ??= await abrir());
export const db = drizzle(cliente, { schema });

/**
 * Crea el esquema si falta y pone al día una base de una versión anterior. Va
 * en el nivel superior del módulo: cualquiera que importe `db` espera a que
 * termine, así ninguna consulta corre contra una base sin tablas.
 */
await preparar();

async function preparar(): Promise<void> {
  await cliente.executeMultiple(SQL_BOOTSTRAP);
  for (const { tabla, columna, definicion } of COLUMNAS_AGREGADAS) {
    const info = await cliente.execute(`PRAGMA table_info(${tabla})`);
    if (!info.rows.some((f) => f.name === columna)) {
      await cliente.execute(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
    }
  }
}
