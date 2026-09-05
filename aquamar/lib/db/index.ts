import "server-only";
import { drizzle } from "drizzle-orm/libsql";
import type { Client } from "@libsql/client";
import * as schema from "./schema";
import { COLUMNAS_AGREGADAS, SQL_BOOTSTRAP, SQL_DATOS_MINIMOS, VERSION_ESQUEMA } from "./bootstrap";

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
 * `next build` importa cada módulo para leer la configuración de las páginas, y
 * eso ejecuta este archivo. Compilar no tiene por qué depender de que la base
 * esté al alcance del servidor que compila: si lo hiciera, un token vencido o
 * una red cortada rompen el despliegue de algo que ni siquiera consulta datos.
 *
 * Durante la compilación se abre una base en memoria que nadie usa —las dos
 * únicas páginas que se prerrenderizan no consultan nada— y el esquema se
 * prepara recién en el primer pedido real.
 */
const COMPILANDO = process.env.NEXT_PHASE === "phase-production-build";

/**
 * La misma app corre contra una base alojada o contra un archivo local. En
 * producción serverless el archivo no sirve: cada invocación arranca con disco
 * vacío, así que sin TURSO_DATABASE_URL falla de entrada en vez de perder datos
 * en silencio.
 */
async function abrir(): Promise<Client> {
  if (COMPILANDO) {
    const { createClient } = await import("@libsql/client");
    return createClient({ url: ":memory:" });
  }

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
if (!COMPILANDO) await preparar();

/**
 * Con la base ya al día esto es una sola consulta. Importa: en serverless cada
 * arranque en frío corre esto antes de contestar, y la puesta a punto completa
 * son decenas de idas y vueltas a una base que está del otro lado de la red.
 */
async function alDia(): Promise<boolean> {
  try {
    const fila = await cliente.execute({
      sql: "select valor from configuracion where clave = ?",
      args: ["esquema_version"],
    });
    return fila.rows[0]?.valor === VERSION_ESQUEMA;
  } catch {
    // La tabla todavía no existe —base nueva o de una versión anterior—, o la
    // base no contesta. En los dos casos hay que seguir: si no contesta, la
    // consulta siguiente falla igual y con un mensaje que dice qué pasó.
    return false;
  }
}

async function preparar(): Promise<void> {
  if (await alDia()) return;

  await cliente.executeMultiple(SQL_BOOTSTRAP);

  // Una lectura por tabla, no una por columna: PRAGMA devuelve todas juntas.
  const tablas = [...new Set(COLUMNAS_AGREGADAS.map((c) => c.tabla))];
  const columnasPorTabla = new Map<string, Set<string>>();
  for (const tabla of tablas) {
    const info = await cliente.execute(`PRAGMA table_info(${tabla})`);
    columnasPorTabla.set(tabla, new Set(info.rows.map((f) => String(f.name))));
  }

  for (const { tabla, columna, definicion } of COLUMNAS_AGREGADAS) {
    if (!columnasPorTabla.get(tabla)?.has(columna)) {
      await cliente.execute(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
    }
  }

  // Va después de las columnas: toca datos que dependen de que existan.
  await cliente.executeMultiple(SQL_DATOS_MINIMOS);

  await cliente.execute({
    sql: `insert into configuracion (clave, valor, actualizado_en) values (?, ?, ?)
          on conflict(clave) do update set valor = excluded.valor, actualizado_en = excluded.actualizado_en`,
    args: ["esquema_version", VERSION_ESQUEMA, new Date().toISOString()],
  });
}
