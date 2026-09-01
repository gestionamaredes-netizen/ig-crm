/**
 * Datos de arranque: las categorías de gasto habituales y, si la base está
 * vacía, un producto y un comercio de ejemplo para poder recorrer la app.
 *
 *   npm run db:seed
 *
 * Apunta a la misma base que la app: el archivo local, o Turso si están
 * definidas TURSO_DATABASE_URL y TURSO_AUTH_TOKEN.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { COLUMNAS_AGREGADAS, SQL_BOOTSTRAP } from "./bootstrap";
import * as t from "./schema";

const remota = process.env.TURSO_DATABASE_URL;
let destino: string;
if (remota) {
  destino = remota;
} else {
  const ruta = path.resolve(process.env.DATABASE_FILE ?? "./data/aquamar.sqlite");
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  destino = `file:${ruta}`;
}

const cliente = createClient({ url: destino, authToken: process.env.TURSO_AUTH_TOKEN });
await cliente.executeMultiple(SQL_BOOTSTRAP);
for (const { tabla, columna, definicion } of COLUMNAS_AGREGADAS) {
  const info = await cliente.execute(`PRAGMA table_info(${tabla})`);
  if (!info.rows.some((f) => f.name === columna)) {
    await cliente.execute(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
  }
}
const db = drizzle(cliente, { schema: t });

const ahora = new Date().toISOString();
const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
const id = () => crypto.randomUUID();
const token = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");

const CATEGORIAS: [string, "operativo" | "logistico"][] = [
  ["Empleados", "operativo"],
  ["Servicios", "operativo"],
  ["Alquiler", "operativo"],
  ["Galpón", "operativo"],
  ["Transporte", "logistico"],
  ["Combustible", "logistico"],
];

let nuevas = 0;
for (const [nombre, tipo] of CATEGORIAS) {
  const existe = await db.select().from(t.categoriasGasto).where(eq(t.categoriasGasto.nombre, nombre)).get();
  if (!existe) {
    await db.insert(t.categoriasGasto).values({ id: id(), nombre, tipo, activo: true, creadoEn: ahora }).run();
    nuevas++;
  }
}
console.log(`Categorías de gasto: ${nuevas} nuevas, ${CATEGORIAS.length - nuevas} ya estaban.`);

const hayProductos = (await db.select().from(t.productos).all()).length > 0;
if (!hayProductos) {
  const productoId = id();
  const EXISTENCIA_INICIAL = 200;

  await db.insert(t.productos)
    .values({
      id: productoId,
      nombre: "Powerfull 3 en 1",
      presentacion: "Caja x 30 cápsulas",
      stock: EXISTENCIA_INICIAL,
      stockMinimo: 50,
      costoCentavos: 450000,
      precioCentavos: 750000,
      activo: true,
      creadoEn: ahora,
    })
    .run();

  // Todo saldo del depósito tiene que poder explicarse desde el libro.
  await db.insert(t.movimientosStock)
    .values({
      id: id(),
      productoId,
      tipo: "entrada",
      cantidad: EXISTENCIA_INICIAL,
      stockResultante: EXISTENCIA_INICIAL,
      motivo: "Existencia inicial",
      fecha: hoy,
      registradoPor: "Depósito",
      creadoEn: ahora,
    })
    .run();

  console.log("Producto de ejemplo cargado: Powerfull 3 en 1 (200 unidades, mínimo 50).");
}

const hayClientes = (await db.select().from(t.clientes).all()).length > 0;
if (!hayClientes) {
  const clienteId = id();
  await db.insert(t.clientes)
    .values({
      id: clienteId,
      comercio: "Almacén Don Pedro",
      persona: "Pedro Giménez",
      telefono: "11 5555 4444",
      direccion: "Av. Rivadavia 1234",
      email: "donpedro@ejemplo.com",
      redes: "@almacendonpedro",
      notas: "Comercio de ejemplo, borralo cuando cargues los tuyos.",
      activo: true,
      creadoEn: ahora,
    })
    .run();

  const tokenDueno = token();
  const tokenRepre = token();
  await db.insert(t.accesos)
    .values([
      { id: id(), clienteId, nombre: "Pedro Giménez", rol: "cliente", token: tokenDueno, activo: true, creadoEn: ahora },
      { id: id(), clienteId, nombre: "Repositor de zona", rol: "representante", token: tokenRepre, activo: true, creadoEn: ahora },
    ])
    .run();

  console.log("\nComercio de ejemplo creado. Links de acceso:");
  console.log(`  Dueño:         http://localhost:3000/acceso/${tokenDueno}`);
  console.log(`  Representante: http://localhost:3000/acceso/${tokenRepre}`);
}

console.log(`\nBase lista en ${destino} (${hoy}).`);
cliente.close();
