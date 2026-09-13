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

CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  actualizado_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pagos_comision (
  id TEXT PRIMARY KEY,
  vendedor_id TEXT NOT NULL REFERENCES vendedores(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  monto_centavos INTEGER NOT NULL DEFAULT 0,
  forma TEXT NOT NULL DEFAULT 'efectivo',
  notas TEXT NOT NULL DEFAULT '',
  creado_en TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS pagos_comision_vendedor_idx ON pagos_comision(vendedor_id);

CREATE TABLE IF NOT EXISTS vendedores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'azul',
  modalidad TEXT NOT NULL DEFAULT 'comisión',
  comision_por_bulto_centavos INTEGER NOT NULL DEFAULT 0,
  lista_precio_id TEXT,
  telefono TEXT NOT NULL DEFAULT '',
  notas TEXT NOT NULL DEFAULT '',
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS proveedores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  cuit TEXT NOT NULL DEFAULT '',
  condicion_fiscal TEXT NOT NULL DEFAULT '',
  telefono TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  direccion TEXT NOT NULL DEFAULT '',
  notas TEXT NOT NULL DEFAULT '',
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS compras (
  id TEXT PRIMARY KEY,
  numero INTEGER NOT NULL,
  proveedor_id TEXT NOT NULL REFERENCES proveedores(id),
  fecha TEXT NOT NULL,
  comprobante TEXT NOT NULL DEFAULT '',
  neto_centavos INTEGER NOT NULL DEFAULT 0,
  iva_centavos INTEGER NOT NULL DEFAULT 0,
  percepciones_centavos INTEGER NOT NULL DEFAULT 0,
  otros_centavos INTEGER NOT NULL DEFAULT 0,
  total_centavos INTEGER NOT NULL DEFAULT 0,
  forma_pago TEXT NOT NULL DEFAULT 'transferencia',
  pagado_centavos INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'borrador',
  regimen_al_confirmar TEXT NOT NULL DEFAULT '',
  notas TEXT NOT NULL DEFAULT '',
  creado_en TEXT NOT NULL,
  confirmada_en TEXT
);
CREATE INDEX IF NOT EXISTS compras_proveedor_idx ON compras(proveedor_id);
CREATE INDEX IF NOT EXISTS compras_fecha_idx ON compras(fecha);

CREATE TABLE IF NOT EXISTS compra_items (
  id TEXT PRIMARY KEY,
  compra_id TEXT NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  producto_id TEXT NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL DEFAULT 0,
  costo_unit_neto_centavos INTEGER NOT NULL DEFAULT 0,
  iva_alicuota INTEGER NOT NULL DEFAULT 2100,
  iva_centavos INTEGER NOT NULL DEFAULT 0,
  prorrateo_centavos INTEGER NOT NULL DEFAULT 0,
  costo_real_unit_centavos INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS compra_items_compra_idx ON compra_items(compra_id);
CREATE INDEX IF NOT EXISTS compra_items_producto_idx ON compra_items(producto_id);

CREATE TABLE IF NOT EXISTS listas_precio (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  predeterminada INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS movimientos_caja (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL,
  medio TEXT NOT NULL DEFAULT 'efectivo',
  monto_centavos INTEGER NOT NULL,
  concepto TEXT NOT NULL DEFAULT '',
  pedido_id TEXT,
  compra_id TEXT,
  gasto_id TEXT,
  creado_en TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS caja_fecha_idx ON movimientos_caja(fecha);
CREATE INDEX IF NOT EXISTS caja_gasto_idx ON movimientos_caja(gasto_id);

CREATE TABLE IF NOT EXISTS escalas_precio (
  id TEXT PRIMARY KEY,
  lista_id TEXT NOT NULL DEFAULT '',
  producto_id TEXT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  desde_cantidad INTEGER NOT NULL DEFAULT 1,
  precio_centavos INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS escalas_producto_idx ON escalas_precio(producto_id);

CREATE TABLE IF NOT EXISTS bitacora (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL,
  actor TEXT NOT NULL,
  accion TEXT NOT NULL,
  entidad TEXT NOT NULL DEFAULT '',
  entidad_id TEXT,
  detalle TEXT NOT NULL DEFAULT '',
  creado_en TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS bitacora_fecha_idx ON bitacora(fecha);
`;

/**
 * Columnas agregadas después de la primera versión. CREATE TABLE IF NOT EXISTS
 * no las suma a una base que ya existe, así que se aplican aparte.
 */
export const COLUMNAS_AGREGADAS = [
  { tabla: "productos", columna: "stock_minimo", definicion: "INTEGER NOT NULL DEFAULT 0" },
  { tabla: "productos", columna: "ultimo_costo_centavos", definicion: "INTEGER NOT NULL DEFAULT 0" },
  { tabla: "movimientos_stock", columna: "compra_id", definicion: "TEXT" },
  { tabla: "clientes", columna: "razon_social", definicion: "TEXT NOT NULL DEFAULT ''" },
  { tabla: "clientes", columna: "cuit", definicion: "TEXT NOT NULL DEFAULT ''" },
  { tabla: "clientes", columna: "condicion_fiscal", definicion: "TEXT NOT NULL DEFAULT ''" },
  { tabla: "clientes", columna: "tipo", definicion: "TEXT NOT NULL DEFAULT 'comercio'" },
  { tabla: "clientes", columna: "lista_precio_id", definicion: "TEXT" },
  { tabla: "pedidos", columna: "forma_pago", definicion: "TEXT NOT NULL DEFAULT 'efectivo'" },
  { tabla: "pedidos", columna: "cobrado_centavos", definicion: "INTEGER NOT NULL DEFAULT 0" },
  { tabla: "gastos", columna: "medio_pago", definicion: "TEXT NOT NULL DEFAULT 'efectivo'" },
  { tabla: "escalas_precio", columna: "lista_id", definicion: "TEXT NOT NULL DEFAULT ''" },
  { tabla: "pedidos", columna: "fecha_entrega", definicion: "TEXT" },
  { tabla: "pedidos", columna: "tipo_entrega", definicion: "TEXT NOT NULL DEFAULT 'reparto propio'" },
  { tabla: "productos", columna: "unidades_por_bulto", definicion: "INTEGER NOT NULL DEFAULT 12" },
  { tabla: "movimientos_caja", columna: "forma", definicion: "TEXT NOT NULL DEFAULT ''" },
  { tabla: "clientes", columna: "vendedor_id", definicion: "TEXT" },
  { tabla: "pedidos", columna: "vendedor_id", definicion: "TEXT" },
  { tabla: "pedidos", columna: "comision_centavos", definicion: "INTEGER NOT NULL DEFAULT 0" },
  { tabla: "movimientos_caja", columna: "pago_comision_id", definicion: "TEXT" },
  { tabla: "pedidos", columna: "comision_origen", definicion: "TEXT NOT NULL DEFAULT 'fija'" },
  { tabla: "pedidos", columna: "comision_detalle", definicion: "TEXT NOT NULL DEFAULT ''" },
  { tabla: "clientes", columna: "vendedor_origen_id", definicion: "TEXT" },
] as const;

/**
 * Se sube cada vez que cambia el esquema. La app guarda esta marca en la base y
 * en el arranque siguiente le alcanza con leerla para saber que no hay nada que
 * hacer: sin esto, cada arranque en frío pagaba treinta idas y vueltas a Turso
 * antes de contestar el primer pedido.
 */
export const VERSION_ESQUEMA = "2026-09-13-vendedor-de-origen";

/**
 * Datos mínimos para que la app tenga sentido apenas arranca, y arreglos de
 * datos que dejó una versión anterior. Corre en cada arranque y es idempotente.
 *
 * La lista de precios predeterminada tiene id fijo a propósito: así el INSERT
 * se puede repetir sin duplicar y sin tener que generar un UUID desde SQL.
 */
export const SQL_DATOS_MINIMOS = `
INSERT OR IGNORE INTO listas_precio (id, nombre, predeterminada, activo, creado_en)
  SELECT 'lista-general', 'Lista general', 1, 1, datetime('now')
  WHERE NOT EXISTS (SELECT 1 FROM listas_precio);

UPDATE escalas_precio
  SET lista_id = (SELECT id FROM listas_precio WHERE predeterminada = 1 LIMIT 1)
  WHERE lista_id = '' OR lista_id IS NULL;

-- Los cobros anteriores a que existiera la columna guardaban la forma dentro
-- del concepto ("Cobro del pedido #3 · transferencia (parcial)"). Se rescata de
-- ahí para que el desglose del período no arranque con un hueco.
UPDATE movimientos_caja
  SET forma = replace(substr(concepto, instr(concepto, ' · ') + 3), ' (parcial)', '')
  WHERE forma = '' AND pedido_id IS NOT NULL AND instr(concepto, ' · ') > 0;

-- Antes había un solo vendedor por comercio y hacía de las dos cosas. Al
-- separarlas, el que estaba asignado pasa a ser también el de origen: es lo
-- único que los datos permiten afirmar, y dejar el origen vacío perdería la
-- información que sí había.
UPDATE clientes
  SET vendedor_origen_id = vendedor_id
  WHERE vendedor_origen_id IS NULL AND vendedor_id IS NOT NULL;
`;
