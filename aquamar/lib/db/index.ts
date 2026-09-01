import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { COLUMNAS_AGREGADAS, SQL_BOOTSTRAP } from "./bootstrap";

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
  agregarColumnasFaltantes(sqlite);
  return sqlite;
}

/** Pone al día una base creada por una versión anterior del esquema. */
export function agregarColumnasFaltantes(sqlite: Database.Database): void {
  for (const { tabla, columna, definicion } of COLUMNAS_AGREGADAS) {
    const existentes = sqlite.prepare(`PRAGMA table_info(${tabla})`).all() as { name: string }[];
    if (!existentes.some((c) => c.name === columna)) {
      sqlite.exec(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
    }
  }
}

export const sqlite = (global_.__aquamarDb ??= abrir());
export const db = drizzle(sqlite, { schema });
