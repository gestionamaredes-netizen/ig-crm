const express = require('express');
const router = express.Router();
const db = require('./database');
const { Producto, Venta, Arqueo, Compra } = db;
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

// ========== PRODUCTOS ==========
router.get('/productos', async (req, res) => {
  try {
    await db.init();
    const productos = await Producto.find().sort({ nombre: 1 }).lean();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/productos', async (req, res) => {
  const { codigo, nombre, categoria, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor } = req.body;
  try {
    await db.init();
    const producto = await Producto.create({
      codigo,
      nombre,
      categoria,
      precio_costo,
      precio_venta,
      stock_actual: stock_actual || 0,
      stock_minimo: stock_minimo || 5,
      proveedor
    });
    res.json({ id: producto._id, message: 'Producto creado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/productos/:id', async (req, res) => {
  const { codigo, nombre, categoria, precio_costo, precio_venta, stock_actual, stock_minimo, proveedor } = req.body;
  try {
    await db.init();
    await Producto.findByIdAndUpdate(req.params.id, {
      codigo,
      nombre,
      categoria,
      precio_costo,
      precio_venta,
      stock_actual,
      stock_minimo,
      proveedor
    });
    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/productos/:id', async (req, res) => {
  try {
    await db.init();
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== VENTAS ==========
router.post('/ventas', async (req, res) => {
  const { producto_id, cantidad, metodo_pago = 'EFECTIVO' } = req.body;
  try {
    await db.init();
    const producto = await Producto.findById(producto_id);

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    if (producto.stock_actual < cantidad) return res.status(400).json({ error: 'Stock insuficiente' });

    const monto_total = producto.precio_venta * cantidad;
    const fecha = new Date();

    await Venta.create({
      fecha,
      hora: format(fecha, 'HH:mm:ss'),
      producto_id,
      cantidad,
      precio_unitario: producto.precio_venta,
      monto_total,
      metodo_pago
    });

    await Producto.findByIdAndUpdate(producto_id, {
      $inc: { stock_actual: -cantidad }
    });

    res.json({ message: 'Venta registrada', monto: monto_total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/ventas', async (req, res) => {
  try {
    await db.init();
    const ventas = await Venta.find()
      .populate('producto_id', 'nombre categoria')
      .sort({ created_at: -1 })
      .lean();

    const ventasFormateadas = ventas.map(v => ({
      ...v,
      nombre: v.producto_id?.nombre,
      categoria: v.producto_id?.categoria
    }));

    res.json(ventasFormateadas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/ventas/diarias/:fecha', async (req, res) => {
  try {
    await db.init();
    const fecha = new Date(req.params.fecha);
    const fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const fechaFin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1);

    const ventas = await Venta.find({
      fecha: { $gte: fechaInicio, $lt: fechaFin }
    })
      .populate('producto_id', 'nombre categoria')
      .sort({ hora: 1 })
      .lean();

    const ventasFormateadas = ventas.map(v => ({
      ...v,
      nombre: v.producto_id?.nombre,
      categoria: v.producto_id?.categoria
    }));

    const total = ventasFormateadas.reduce((sum, v) => sum + v.monto_total, 0);
    res.json({ ventas: ventasFormateadas, total, fecha: req.params.fecha });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ARQUEO DE CAJA ==========
router.post('/arqueo', async (req, res) => {
  const { fecha, monto_real, observaciones } = req.body;
  try {
    await db.init();
    const fechaObj = new Date(fecha);
    const fechaInicio = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate());
    const fechaFin = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate() + 1);

    const ventasAggregate = await Venta.aggregate([
      {
        $match: {
          fecha: { $gte: fechaInicio, $lt: fechaFin }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$monto_total' }
        }
      }
    ]);

    const monto_esperado = ventasAggregate[0]?.total || 0;
    const diferencia = monto_real - monto_esperado;

    await Arqueo.create({
      fecha: fechaObj,
      monto_esperado,
      monto_real,
      diferencia,
      observaciones
    });

    res.json({ monto_esperado, monto_real, diferencia, estado: diferencia === 0 ? 'OK' : 'DIFERENCIA' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/arqueos', async (req, res) => {
  try {
    await db.init();
    const arqueos = await Arqueo.find().sort({ fecha: -1 }).lean();
    res.json(arqueos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== DASHBOARD ==========
router.get('/dashboard', async (req, res) => {
  try {
    await db.init();
    const fecha = new Date();
    const fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const fechaFin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1);

    // Ventas de hoy
    const ventasHoyAggregate = await Venta.aggregate([
      {
        $match: {
          fecha: { $gte: fechaInicio, $lt: fechaFin }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$monto_total' }
        }
      }
    ]);
    const totalVentas = ventasHoyAggregate[0]?.total || 0;

    // Productos con stock bajo
    const productosStock = await Producto.find({
      $expr: { $lt: ['$stock_actual', '$stock_minimo'] }
    }).lean();

    // Top productos
    const topProductos = await Venta.aggregate([
      {
        $match: {
          fecha: { $gte: fechaInicio, $lt: fechaFin }
        }
      },
      {
        $group: {
          _id: '$producto_id',
          cantidad_vendida: { $sum: '$cantidad' }
        }
      },
      {
        $lookup: {
          from: 'productos',
          localField: '_id',
          foreignField: '_id',
          as: 'producto'
        }
      },
      {
        $unwind: '$producto'
      },
      {
        $project: {
          nombre: '$producto.nombre',
          cantidad_vendida: 1
        }
      },
      {
        $sort: { cantidad_vendida: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      fecha: format(fecha, 'yyyy-MM-dd'),
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
