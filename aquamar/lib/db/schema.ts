import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Todos los importes se guardan en centavos (enteros). SQLite no tiene decimal
 * y los float arrastran errores de redondeo al sumar cientos de renglones.
 */

// Productos del mayorista
export const productos = sqliteTable("productos", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  presentacion: text("presentacion").notNull().default(""),
  stock: integer("stock").notNull().default(0),
  costoCentavos: integer("costo_centavos").notNull().default(0),
  precioCentavos: integer("precio_centavos").notNull().default(0),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: text("creado_en").notNull(),
});

// Ficha de cliente (comercio)
export const clientes = sqliteTable("clientes", {
  id: text("id").primaryKey(),
  comercio: text("comercio").notNull(),
  persona: text("persona").notNull().default(""),
  telefono: text("telefono").notNull().default(""),
  direccion: text("direccion").notNull().default(""),
  email: text("email").notNull().default(""),
  redes: text("redes").notNull().default(""),
  notas: text("notas").notNull().default(""),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: text("creado_en").notNull(),
});

/**
 * Accesos al panel de un cliente. Cada fila es un link propio: el del dueño del
 * comercio y los de sus representantes. Se revoca uno sin tocar los demás.
 */
export const accesos = sqliteTable("accesos", {
  id: text("id").primaryKey(),
  clienteId: text("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  rol: text("rol").notNull().default("cliente"), // cliente | representante
  token: text("token").notNull().unique(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: text("creado_en").notNull(),
  ultimoAccesoEn: text("ultimo_acceso_en"),
});

export const ESTADOS_PEDIDO = ["pendiente", "preparando", "entregado", "cancelado"] as const;
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];

export const pedidos = sqliteTable("pedidos", {
  id: text("id").primaryKey(),
  numero: integer("numero").notNull(),
  clienteId: text("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  estado: text("estado").$type<EstadoPedido>().notNull().default("pendiente"),
  notas: text("notas").notNull().default(""),
  origen: text("origen").notNull().default("admin"), // admin | cliente | representante
  creadoPor: text("creado_por").notNull().default(""),
  creadoEn: text("creado_en").notNull(),
  entregadoEn: text("entregado_en"),
});

/**
 * El precio y el costo se congelan al momento del pedido: si mañana cambia la
 * lista, el margen histórico tiene que seguir dando lo mismo.
 */
export const pedidoItems = sqliteTable("pedido_items", {
  id: text("id").primaryKey(),
  pedidoId: text("pedido_id")
    .notNull()
    .references(() => pedidos.id, { onDelete: "cascade" }),
  productoId: text("producto_id")
    .notNull()
    .references(() => productos.id),
  cantidad: integer("cantidad").notNull().default(0),
  precioUnitCentavos: integer("precio_unit_centavos").notNull().default(0),
  costoUnitCentavos: integer("costo_unit_centavos").notNull().default(0),
});

// Categorías de gasto: ampliables desde el panel, no una lista fija en código.
export const categoriasGasto = sqliteTable("categorias_gasto", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull().unique(),
  tipo: text("tipo").notNull().default("operativo"), // operativo | logistico
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: text("creado_en").notNull(),
});

// pedidoId opcional: un gasto logístico puede imputarse a un pedido puntual.
export const gastos = sqliteTable("gastos", {
  id: text("id").primaryKey(),
  categoriaId: text("categoria_id")
    .notNull()
    .references(() => categoriasGasto.id),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  montoCentavos: integer("monto_centavos").notNull().default(0),
  descripcion: text("descripcion").notNull().default(""),
  pedidoId: text("pedido_id").references(() => pedidos.id, { onDelete: "set null" }),
  creadoEn: text("creado_en").notNull(),
});

/**
 * Ventas que el cliente declara desde su panel. El stock disponible del cliente
 * es lo entregado menos lo vendido.
 */
export const ventasCliente = sqliteTable("ventas_cliente", {
  id: text("id").primaryKey(),
  clienteId: text("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  productoId: text("producto_id")
    .notNull()
    .references(() => productos.id),
  cantidad: integer("cantidad").notNull().default(0),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  registradoPor: text("registrado_por").notNull().default(""),
  creadoEn: text("creado_en").notNull(),
});
