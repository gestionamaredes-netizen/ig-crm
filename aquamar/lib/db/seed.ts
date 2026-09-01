/**
 * Datos de arranque: las categorías de gasto habituales y, si la base está
 * vacía, un producto y un comercio de ejemplo para poder recorrer la app.
 *
 *   npm run db:seed
 */
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { SQL_BOOTSTRAP } from "./bootstrap";
import * as t from "./schema";

const ruta = path.resolve(process.env.DATABASE_FILE ?? "./data/aquamar.sqlite");
fs.mkdirSync(path.dirname(ruta), { recursive: true });
const sqlite = new Database(ruta);
sqlite.pragma("foreign_keys = ON");
sqlite.exec(SQL_BOOTSTRAP);
const db = drizzle(sqlite, { schema: t });

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
  const existe = db.select().from(t.categoriasGasto).where(eq(t.categoriasGasto.nombre, nombre)).get();
  if (!existe) {
    db.insert(t.categoriasGasto).values({ id: id(), nombre, tipo, activo: true, creadoEn: ahora }).run();
    nuevas++;
  }
}
console.log(`Categorías de gasto: ${nuevas} nuevas, ${CATEGORIAS.length - nuevas} ya estaban.`);

const hayProductos = db.select().from(t.productos).all().length > 0;
if (!hayProductos) {
  db.insert(t.productos)
    .values({
      id: id(),
      nombre: "Powerfull 3 en 1",
      presentacion: "Caja x 30 cápsulas",
      stock: 200,
      costoCentavos: 450000,
      precioCentavos: 750000,
      activo: true,
      creadoEn: ahora,
    })
    .run();
  console.log("Producto de ejemplo cargado: Powerfull 3 en 1.");
}

const hayClientes = db.select().from(t.clientes).all().length > 0;
if (!hayClientes) {
  const clienteId = id();
  db.insert(t.clientes)
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
  db.insert(t.accesos)
    .values([
      { id: id(), clienteId, nombre: "Pedro Giménez", rol: "cliente", token: tokenDueno, activo: true, creadoEn: ahora },
      { id: id(), clienteId, nombre: "Repositor de zona", rol: "representante", token: tokenRepre, activo: true, creadoEn: ahora },
    ])
    .run();

  console.log("\nComercio de ejemplo creado. Links de acceso:");
  console.log(`  Dueño:         http://localhost:3000/acceso/${tokenDueno}`);
  console.log(`  Representante: http://localhost:3000/acceso/${tokenRepre}`);
}

console.log(`\nBase lista en ${ruta} (${hoy}).`);
sqlite.close();
