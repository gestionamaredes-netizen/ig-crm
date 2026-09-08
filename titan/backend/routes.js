const express = require('express');
const router = express.Router();
const db = require('./database');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

// ========== PRODUCTOS ==========
router.get('/productos', async (req, res) => {
  try {
    const productos = await db.all('SELECT * FROM productos ORDER BY nombre');
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/productos', async (req, res) => {
  const { codigo, nombre, categoria, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor } = req.body;
  try {
    const result = await db.run(
      'INSERT INTO productos (codigo, nombre, categoria, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [codigo, nombre, categoria, precio_costo, precio_venta, stock_actual, stock_minimo || 5, proveedor]
    );
    res.json({ id: result.lastID, message: 'Producto creado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/productos/:id', async (req, res) => {
  const { codigo, nombre, categoria, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor } = req.body;
  try {
    await db.run(
      'UPDATE productos SET codigo=?, nombre=?, categoria=?, precio_costo=?, precio_venta=?, stock_actual=?, stock_minimo=?, proveedor=? WHERE id=?',
      [codigo, nombre, categoria, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor, req.params.id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/productos/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM productos WHERE id=?', [req.params.id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== VENTAS ==========
router.post('/ventas', async (req, res) => {
  const { producto_id, cantidad, metodo_pago = 'EFECTIVO' } = req.body;
  try {
    const producto = await db.get('SELECT * FROM productos WHERE id=?', [producto_id]);

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    if (producto.stock_actual < cantidad) return res.status(400).json({ error: 'Stock insuficiente' });

    const monto_total = producto.precio_venta * cantidad;
    const fecha = format(new Date(), 'yyyy-MM-dd');
    const hora = format(new Date(), 'HH:mm:ss');

    await db.run(
      'INSERT INTO ventas (fecha, hora, producto_id, cantidad, precio_unitario, monto_total, metodo_pago) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [fecha, hora, producto_id, cantidad, producto.precio_venta, monto_total, metodo_pago]
    );

    await db.run('UPDATE productos SET stock_actual = stock_actual - ? WHERE id=?', [cantidad, producto_id]);

    res.json({ message: 'Venta registrada', monto: monto_total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/ventas', async (req, res) => {
  try {
    const ventas = await db.all(`
      SELECT v.*, p.nombre, p.categoria
      FROM ventas v
      JOIN productos p ON v.producto_id = p.id
      ORDER BY v.created_at DESC
    `);
    res.json(ventas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/ventas/diarias/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    const ventas = await db.all(`
      SELECT v.*, p.nombre, p.categoria
      FROM ventas v
      JOIN productos p ON v.producto_id = p.id
      WHERE DATE(v.fecha) = ?
      ORDER BY v.hora
    `, [fecha]);

    const total = ventas.reduce((sum, v) => sum + v.monto_total, 0);
    res.json({ ventas, total, fecha });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ARQUEO DE CAJA ==========
router.post('/arqueo', async (req, res) => {
  const { fecha, monto_real, observaciones } = req.body;
  try {
    const ventas = await db.all(
      'SELECT SUM(monto_total) as total FROM ventas WHERE fecha=?',
      [fecha]
    );

    const monto_esperado = ventas[0]?.total || 0;
    const diferencia = monto_real - monto_esperado;

    await db.run(
      'INSERT INTO arqueo_caja (fecha, monto_esperado, monto_real, diferencia, observaciones) VALUES (?, ?, ?, ?, ?)',
      [fecha, monto_esperado, monto_real, diferencia, observaciones]
    );

    res.json({ monto_esperado, monto_real, diferencia, estado: diferencia === 0 ? 'OK' : 'DIFERENCIA' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/arqueos', async (req, res) => {
  try {
    const arqueos = await db.all('SELECT * FROM arqueo_caja ORDER BY fecha DESC');
    res.json(arqueos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== DASHBOARD ==========
router.get('/dashboard', async (req, res) => {
  try {
    const fecha = format(new Date(), 'yyyy-MM-dd');

    const ventasHoy = await db.all('SELECT SUM(monto_total) as total FROM ventas WHERE fecha=?', [fecha]);
    const totalVentas = ventasHoy[0]?.total || 0;

    const productosStock = await db.all('SELECT * FROM productos WHERE stock_actual < stock_minimo');

    const topProductos = await db.all(`
      SELECT p.nombre, SUM(v.cantidad) as cantidad_vendida
      FROM ventas v
      JOIN productos p ON v.producto_id = p.id
      WHERE v.fecha = ?
      GROUP BY p.id
      ORDER BY cantidad_vendida DESC
      LIMIT 5
    `, [fecha]);

    res.json({
      fecha,
      ventasHoy: totalVentas,
      alertasStock: productosStock.length,
      productosAlerta: productosStock,
      topProductos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
