/**
 * Esquema en SQL plano. Espeja lib/db/schema.ts y corre en cada arranque para
 * que la app no dependa de un paso de migración manual. Si tocás el schema de
 * Drizzle, tocá también este archivo.
 */
export const SQL_BOOTSTRAP = `
CREATE TABLE IF NOT EXISTS productos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  presentacion TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  costo_centavos INTEGER NOT NULL DEFAULT 0,
  precio_centavos INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS movimientos_stock (
  id TEXT PRIMARY KEY,
  producto_id TEXT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  stock_resultante INTEGER NOT NULL,
  motivo TEXT NOT NULL DEFAULT '',
  pedido_id TEXT,
  fecha TEXT NOT NULL,
  registrado_por TEXT NOT NULL DEFAULT '',
  creado_en TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS movimientos_producto_idx ON movimientos_stock(producto_id);
CREATE INDEX IF NOT EXISTS movimientos_fecha_idx ON movimientos_stock(fecha);

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  comercio TEXT NOT NULL,
  persona TEXT NOT NULL DEFAULT '',
  telefono TEXT NOT NULL DEFAULT '',
  direccion TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  redes TEXT NOT NULL DEFAULT '',
  notas TEXT NOT NULL DEFAULT '',
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accesos (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'cliente',
  token TEXT NOT NULL UNIQUE,
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL,
  ultimo_acceso_en TEXT
);
CREATE INDEX IF NOT EXISTS accesos_cliente_idx ON accesos(cliente_id);

CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,
  numero INTEGER NOT NULL,
  cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  notas TEXT NOT NULL DEFAULT '',
  origen TEXT NOT NULL DEFAULT 'admin',
  creado_por TEXT NOT NULL DEFAULT '',
  creado_en TEXT NOT NULL,
  entregado_en TEXT
);
CREATE INDEX IF NOT EXISTS pedidos_cliente_idx ON pedidos(cliente_id);

CREATE TABLE IF NOT EXISTS pedido_items (
  id TEXT PRIMARY KEY,
  pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id TEXT NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL DEFAULT 0,
  precio_unit_centavos INTEGER NOT NULL DEFAULT 0,
  costo_unit_centavos INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS pedido_items_pedido_idx ON pedido_items(pedido_id);

CREATE TABLE IF NOT EXISTS categorias_gasto (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'operativo',
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gastos (
  id TEXT PRIMARY KEY,
  categoria_id TEXT NOT NULL REFERENCES categorias_gasto(id),
  fecha TEXT NOT NULL,
  monto_centavos INTEGER NOT NULL DEFAULT 0,
  descripcion TEXT NOT NULL DEFAULT '',
  pedido_id TEXT REFERENCES pedidos(id) ON DELETE SET NULL,
  creado_en TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS gastos_fecha_idx ON gastos(fecha);
CREATE INDEX IF NOT EXISTS gastos_pedido_idx ON gastos(pedido_id);

CREATE TABLE IF NOT EXISTS ventas_cliente (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  producto_id TEXT NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL DEFAULT 0,
  fecha TEXT NOT NULL,
  registrado_por TEXT NOT NULL DEFAULT '',
  creado_en TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ventas_cliente_idx ON ventas_cliente(cliente_id);
`;

/**
 * Columnas agregadas después de la primera versión. CREATE TABLE IF NOT EXISTS
 * no las suma a una base que ya existe, así que se aplican aparte.
 */
export const COLUMNAS_AGREGADAS = [
  { tabla: "productos", columna: "stock_minimo", definicion: "INTEGER NOT NULL DEFAULT 0" },
] as const;
