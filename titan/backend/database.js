const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'titan.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error abriendo BD:', err);
  else console.log('📊 Base de datos conectada');
});

const init = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      precio_costo REAL NOT NULL,
      precio_venta REAL NOT NULL,
      stock_actual INTEGER NOT NULL DEFAULT 0,
      stock_minimo INTEGER DEFAULT 5,
      proveedor TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha DATE NOT NULL,
      hora TIME NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      monto_total REAL NOT NULL,
      metodo_pago TEXT DEFAULT 'EFECTIVO',
      usuario TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(producto_id) REFERENCES productos(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS arqueo_caja (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha DATE NOT NULL,
      monto_esperado REAL NOT NULL,
      monto_real REAL NOT NULL,
      diferencia REAL,
      observaciones TEXT,
      usuario TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS compras_proveedor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha DATE NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      monto_total REAL NOT NULL,
      proveedor TEXT,
      usuario TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(producto_id) REFERENCES productos(id)
    )`);

    console.log('✅ Tablas creadas correctamente');
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = { db, init, run, get, all };
