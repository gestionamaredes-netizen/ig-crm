const mongoose = require('mongoose');

// MongoDB connection
let connected = false;

const init = async () => {
  if (connected) return;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/titan';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connected = true;
    console.log('📊 MongoDB conectada');

    // Crear índices
    await Producto.collection.createIndex({ codigo: 1 }, { unique: true });
  } catch (err) {
    console.error('Error conectando MongoDB:', err);
  }
};

// Schemas
const productoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  precio_costo: { type: Number, required: true },
  precio_venta: { type: Number, required: true },
  stock_actual: { type: Number, default: 0 },
  stock_minimo: { type: Number, default: 5 },
  proveedor: String,
  created_at: { type: Date, default: Date.now }
});

const ventaSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  hora: String,
  producto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  cantidad: { type: Number, required: true },
  precio_unitario: { type: Number, required: true },
  monto_total: { type: Number, required: true },
  metodo_pago: { type: String, default: 'EFECTIVO' },
  usuario: { type: String, default: 'admin' },
  created_at: { type: Date, default: Date.now }
});

const arqueoSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  monto_esperado: { type: Number, required: true },
  monto_real: { type: Number, required: true },
  diferencia: Number,
  observaciones: String,
  usuario: { type: String, default: 'admin' },
  created_at: { type: Date, default: Date.now }
});

const compraSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  producto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  cantidad: { type: Number, required: true },
  precio_unitario: { type: Number, required: true },
  monto_total: { type: Number, required: true },
  proveedor: String,
  usuario: { type: String, default: 'admin' },
  created_at: { type: Date, default: Date.now }
});

const Producto = mongoose.model('Producto', productoSchema);
const Venta = mongoose.model('Venta', ventaSchema);
const Arqueo = mongoose.model('Arqueo', arqueoSchema);
const Compra = mongoose.model('Compra', compraSchema);

// Database helper functions
const run = async (operation) => {
  await init();
  return operation();
};

const get = async (Model, query) => {
  await init();
  return Model.findOne(query);
};

const all = async (Model, query = {}, sort = {}) => {
  await init();
  return Model.find(query).sort(sort).lean();
};

module.exports = {
  init,
  run,
  get,
  all,
  Producto,
  Venta,
  Arqueo,
  Compra,
  mongoose
};
