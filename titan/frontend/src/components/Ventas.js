import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';

function Ventas({ apiUrl }) {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await fetch(`${apiUrl}/productos`);
      const datos = await response.json();
      setProductos(datos.filter(p => p.stock_actual > 0));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || cantidad < 1) {
      setMensaje('Selecciona producto y cantidad');
      return;
    }

    const producto = productos.find(p => p.id === parseInt(productoSeleccionado));
    if (!producto) return;

    if (producto.stock_actual < cantidad) {
      setMensaje('Stock insuficiente');
      return;
    }

    const existente = carrito.find(i => i.id === producto.id);
    if (existente) {
      if (producto.stock_actual < existente.cantidad + cantidad) {
        setMensaje('Stock insuficiente para la cantidad solicitada');
        return;
      }
      setCarrito(carrito.map(i =>
        i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad }]);
    }

    setProductoSeleccionado('');
    setCantidad(1);
    setMensaje('');
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(i => i.id !== productoId));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio_venta * item.cantidad), 0);
  };

  const registrarVentas = async () => {
    if (carrito.length === 0) {
      setMensaje('El carrito está vacío');
      return;
    }

    try {
      for (const item of carrito) {
        const response = await fetch(`${apiUrl}/ventas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            producto_id: item.id,
            cantidad: item.cantidad,
            metodo_pago: metodoPago
          })
        });

        if (!response.ok) {
          const error = await response.json();
          setMensaje(`Error: ${error.error}`);
          return;
        }
      }

      setMensaje('✅ Venta registrada correctamente');
      setCarrito([]);
      cargarProductos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setMensaje(`Error: ${err.message}`);
    }
  };

  const total = calcularTotal();

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <ShoppingCart size={28} />
          Registrar Venta
        </h2>

        {mensaje && (
          <div className={`mb-4 p-4 rounded ${mensaje.includes('Error') || mensaje.includes('insuficiente') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
            {mensaje}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Producto</label>
            <select
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            >
              <option value="">Selecciona un producto</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (${p.precio_venta.toFixed(2)}) - Stock: {p.stock_actual}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={agregarAlCarrito}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Carrito */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Carrito de Compras</h3>

        {carrito.length === 0 ? (
          <p className="text-slate-400 text-center py-8">El carrito está vacío</p>
        ) : (
          <div className="space-y-2 mb-4">
            {carrito.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded">
                <div>
                  <p className="text-white font-medium">{item.nombre}</p>
                  <p className="text-slate-400 text-sm">{item.cantidad}x ${item.precio_venta.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-green-400 font-bold">${(item.cantidad * item.precio_venta).toFixed(2)}</p>
                  <button
                    onClick={() => quitarDelCarrito(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-600 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-white">Total:</span>
            <span className="text-2xl font-bold text-green-400">${total.toFixed(2)}</span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Método de Pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          <button
            onClick={registrarVentas}
            disabled={carrito.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded"
          >
            Registrar Venta
          </button>
        </div>
      </div>
    </div>
  );
}

export default Ventas;
