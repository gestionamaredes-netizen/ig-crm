import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { SQL_BOOTSTRAP } from "./bootstrap";

/**
 * Una sola conexión por proceso. En dev, Next recarga los módulos en cada
 * cambio: sin el cache global quedarían decenas de handles abiertos al archivo.
 */
const global_ = globalThis as unknown as { __aquamarDb?: Database.Database };

function abrir(): Database.Database {
  const ruta = path.resolve(process.env.DATABASE_FILE ?? "./data/aquamar.sqlite");
  fs.mkdirSync(path.dirname(ruta), { recursive: true });

  const sqlite = new Database(ruta);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  // Crea el esquema si falta: la app arranca sin paso de migración previo.
  sqlite.exec(SQL_BOOTSTRAP);
  return sqlite;
}

export const sqlite = (global_.__aquamarDb ??= abrir());
export const db = drizzle(sqlite, { schema });
