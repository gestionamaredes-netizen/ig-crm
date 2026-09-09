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
  /*
   * Cuántas unidades trae un bulto. El depósito piensa en bultos, pero el stock
   * se cuenta en unidades: de la unidad cuelgan el precio, el costo y todo el
   * historial de pedidos. Esto es solo la equivalencia para cargar y leer.
   */
  unidadesPorBulto: integer("unidades_por_bulto").notNull().default(12),
  stock: integer("stock").notNull().default(0),
  // Debajo de este número el depósito avisa que hay que reponer.
  stockMinimo: integer("stock_minimo").notNull().default(0),
  // Costo promedio ponderado: se recalcula con cada compra confirmada.
  costoCentavos: integer("costo_centavos").notNull().default(0),
  // Lo que se pagó la última vez. Sirve para ver si el proveedor aumentó.
  ultimoCostoCentavos: integer("ultimo_costo_centavos").notNull().default(0),
  precioCentavos: integer("precio_centavos").notNull().default(0),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: text("creado_en").notNull(),
});

export const TIPOS_MOVIMIENTO = ["entrada", "salida", "ajuste", "devolucion"] as const;
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];

/**
 * Libro de movimientos del depósito. `productos.stock` es el saldo corriente y
 * esta tabla explica cómo se llegó a él: toda alta, entrega y ajuste deja fila.
 */
export const movimientosStock = sqliteTable("movimientos_stock", {
  id: text("id").primaryKey(),
  productoId: text("producto_id")
    .notNull()
    .references(() => productos.id, { onDelete: "cascade" }),
  tipo: text("tipo").$type<TipoMovimiento>().notNull(),
  // Con signo: positivo suma al depósito, negativo saca.
  cantidad: integer("cantidad").notNull(),
  stockResultante: integer("stock_resultante").notNull(),
  motivo: text("motivo").notNull().default(""),
  pedidoId: text("pedido_id"),
  compraId: text("compra_id"),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  registradoPor: text("registrado_por").notNull().default(""),
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
  razonSocial: text("razon_social").notNull().default(""),
  cuit: text("cuit").notNull().default(""),
  condicionFiscal: text("condicion_fiscal").notNull().default(""),
  tipo: text("tipo").notNull().default("comercio"),
  // Sin lista asignada, el pedido se cotiza con la lista predeterminada.
  listaPrecioId: text("lista_precio_id"),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: text("creado_en").notNull(),
});

export const TIPOS_CLIENTE = ["comercio", "mayorista", "distribuidor", "consumidor final"] as const;
export type TipoCliente = (typeof TIPOS_CLIENTE)[number];

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

export const TIPOS_ENTREGA = ["reparto propio", "retira el cliente", "transporte"] as const;
export type TipoEntrega = (typeof TIPOS_ENTREGA)[number];

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
  // Cuándo se prometió entregar y cómo va a viajar la mercadería.
  fechaEntrega: text("fecha_entrega"),
  tipoEntrega: text("tipo_entrega").notNull().default("reparto propio"),
  formaPago: text("forma_pago").notNull().default("efectivo"),
  // Igual que en compras: el estado de cobro se deduce del saldo, no se guarda.
  cobradoCentavos: integer("cobrado_centavos").notNull().default(0),
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
  medioPago: text("medio_pago").notNull().default("efectivo"),
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

/**
 * Ajustes del negocio que no son datos de operación: hoy solo el régimen
 * fiscal, que decide si el IVA de una compra es costo o crédito. Tabla clave /
 * valor para no migrar el esquema cada vez que aparece un ajuste nuevo.
 */
export const configuracion = sqliteTable("configuracion", {
  clave: text("clave").primaryKey(),
  valor: text("valor").notNull(),
  actualizadoEn: text("actualizado_en").notNull(),
});

export const proveedores = sqliteTable("proveedores", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  cuit: text("cuit").notNull().default(""),
  condicionFiscal: text("condicion_fiscal").notNull().default(""),
  telefono: text("telefono").notNull().default(""),
  email: text("email").notNull().default(""),
  direccion: text("direccion").notNull().default(""),
  notas: text("notas").notNull().default(""),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: text("creado_en").notNull(),
});

export const ESTADOS_COMPRA = ["borrador", "confirmada", "anulada"] as const;
export type EstadoCompra = (typeof ESTADOS_COMPRA)[number];

export const FORMAS_PAGO = ["efectivo", "transferencia", "cheque", "cuenta corriente", "otro"] as const;
export type FormaPago = (typeof FORMAS_PAGO)[number];

/**
 * Una compra al proveedor. Nace en borrador y recién al confirmarla entra la
 * mercadería al depósito y se recalcula el costo de cada producto: así una
 * carga a medio hacer no ensucia el stock ni los márgenes.
 *
 * Los totales se guardan aunque salgan de los renglones. Una factura real trae
 * redondeos y percepciones que no cierran contra la suma teórica, y el número
 * que vale es el del papel.
 */
export const compras = sqliteTable("compras", {
  id: text("id").primaryKey(),
  numero: integer("numero").notNull(),
  proveedorId: text("proveedor_id")
    .notNull()
    .references(() => proveedores.id),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  comprobante: text("comprobante").notNull().default(""),
  netoCentavos: integer("neto_centavos").notNull().default(0),
  ivaCentavos: integer("iva_centavos").notNull().default(0),
  percepcionesCentavos: integer("percepciones_centavos").notNull().default(0),
  otrosCentavos: integer("otros_centavos").notNull().default(0),
  totalCentavos: integer("total_centavos").notNull().default(0),
  formaPago: text("forma_pago").notNull().default("transferencia"),
  // El estado de pago se deduce de esto contra el total: no se guarda aparte
  // para que no pueda quedar diciendo "pagado" con saldo abierto.
  pagadoCentavos: integer("pagado_centavos").notNull().default(0),
  estado: text("estado").$type<EstadoCompra>().notNull().default("borrador"),
  // Congelado al confirmar: si mañana cambia el régimen, el costo histórico no se mueve.
  regimenAlConfirmar: text("regimen_al_confirmar").notNull().default(""),
  notas: text("notas").notNull().default(""),
  creadoEn: text("creado_en").notNull(),
  confirmadaEn: text("confirmada_en"),
});

/**
 * Renglón de la factura de compra. `costoRealUnitCentavos` es el costo puesto
 * en el depósito: neto, más la parte que le toca de percepciones y fletes, más
 * el IVA si el régimen no lo deja computar. Se congela al confirmar.
 */
export const compraItems = sqliteTable("compra_items", {
  id: text("id").primaryKey(),
  compraId: text("compra_id")
    .notNull()
    .references(() => compras.id, { onDelete: "cascade" }),
  productoId: text("producto_id")
    .notNull()
    .references(() => productos.id),
  cantidad: integer("cantidad").notNull().default(0),
  costoUnitNetoCentavos: integer("costo_unit_neto_centavos").notNull().default(0),
  // Alícuota en centésimos de punto: 2100 = 21%, 1050 = 10,5%.
  ivaAlicuota: integer("iva_alicuota").notNull().default(2100),
  ivaCentavos: integer("iva_centavos").notNull().default(0),
  // Parte de percepciones y otros costos que le toca a este renglón.
  prorrateoCentavos: integer("prorrateo_centavos").notNull().default(0),
  costoRealUnitCentavos: integer("costo_real_unit_centavos").notNull().default(0),
});

/**
 * Listas de precio. Cada comercio puede tener la suya —distribuidor, mayorista,
 * la general— y siempre hay una predeterminada para los que no tienen asignada.
 */
export const listasPrecio = sqliteTable("listas_precio", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  predeterminada: integer("predeterminada", { mode: "boolean" }).notNull().default(false),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: text("creado_en").notNull(),
});

/**
 * Escalas de precio por producto dentro de una lista: a partir de tantos
 * bultos, tanto la unidad. Al cargar un pedido el sistema sugiere la que
 * corresponde por cantidad, y Comercial la puede pisar a mano.
 */
export const escalasPrecio = sqliteTable("escalas_precio", {
  id: text("id").primaryKey(),
  listaId: text("lista_id").notNull(),
  productoId: text("producto_id")
    .notNull()
    .references(() => productos.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  desdeCantidad: integer("desde_cantidad").notNull().default(1),
  precioCentavos: integer("precio_centavos").notNull().default(0),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: text("creado_en").notNull(),
});

export const MEDIOS_PAGO = ["efectivo", "banco"] as const;
export type MedioPago = (typeof MEDIOS_PAGO)[number];

/**
 * Libro de caja: una fila por cada peso que entra o sale, con el medio por el
 * que pasó. Igual que el libro del depósito, es la única fuente del saldo — no
 * hay un campo "saldo" que pueda quedar desfasado.
 *
 * Los cobros de pedidos, los pagos a proveedores y los gastos escriben acá
 * solos; también se pueden cargar movimientos a mano (saldo inicial, retiros,
 * pases entre efectivo y banco).
 */
export const movimientosCaja = sqliteTable("movimientos_caja", {
  id: text("id").primaryKey(),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  medio: text("medio").$type<MedioPago>().notNull().default("efectivo"),
  // Con signo: positivo entra, negativo sale.
  montoCentavos: integer("monto_centavos").notNull(),
  concepto: text("concepto").notNull().default(""),
  // De dónde vino. Sirve para no duplicar y para poder deshacer.
  pedidoId: text("pedido_id"),
  compraId: text("compra_id"),
  gastoId: text("gasto_id"),
  creadoEn: text("creado_en").notNull(),
});

/**
 * Bitácora: quién tocó qué y cuándo. No reemplaza a los libros de stock y caja
 * —esos explican los saldos—, sino que registra las decisiones: un precio que
 * cambió, una compra anulada, un pedido borrado.
 *
 * Es de solo agregar. Nada en la app la edita ni la borra.
 */
export const bitacora = sqliteTable("bitacora", {
  id: text("id").primaryKey(),
  fecha: text("fecha").notNull(), // YYYY-MM-DD
  actor: text("actor").notNull(),
  accion: text("accion").notNull(),
  entidad: text("entidad").notNull().default(""),
  entidadId: text("entidad_id"),
  detalle: text("detalle").notNull().default(""),
  creadoEn: text("creado_en").notNull(),
});
