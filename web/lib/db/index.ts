import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // No rompemos el import en build; sólo al usar la DB sin config.
  console.warn("[db] DATABASE_URL no está definido. Configurá Supabase en .env.local.");
}

// Reutiliza la conexión en desarrollo (evita agotar el pool con hot-reload).
const globalForDb = globalThis as unknown as { client?: ReturnType<typeof postgres> };
const client = globalForDb.client ?? postgres(connectionString ?? "postgres://invalid", { prepare: false });
if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
export { schema };
