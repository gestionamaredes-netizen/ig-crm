import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, X } from 'lucide-react';

function Productos({ apiUrl }) {
  const [productos, setProductos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editar, setEditar] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Limpieza general',
    precio_costo: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
    proveedor: ''
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await fetch(`${apiUrl}/productos`);
      const datos = await response.json();
      setProductos(datos);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.codigo || !formData.nombre || !formData.precio_venta) {
      setMensaje('Completa los campos requeridos');
      return;
    }

    try {
      const method = editar ? 'PUT' : 'POST';
      const url = editar ? `${apiUrl}/productos/${editar.id}` : `${apiUrl}/productos`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio_costo: parseFloat(formData.precio_costo) || 0,
          precio_venta: parseFloat(formData.precio_venta),
          stock_actual: parseInt(formData.stock_actual) || 0,
          stock_minimo: parseInt(formData.stock_minimo) || 5
        })
      });

      if (response.ok) {
        setMensaje(editar ? '✅ Producto actualizado' : '✅ Producto creado');
        setFormData({
          codigo: '', nombre: '', categoria: 'Limpieza general',
          precio_costo: '', precio_venta: '', stock_actual: '',
          stock_minimo: '', proveedor: ''
        });
        setMostrarForm(false);
        setEditar(null);
        cargarProductos();
        setTimeout(() => setMensaje(''), 3000);
      }
    } catch (err) {
      setMensaje(`Error: ${err.message}`);
    }
  };

  const handleEditar = (producto) => {
    setFormData(producto);
    setEditar(producto);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Eliminar este producto?')) {
      try {
        await fetch(`${apiUrl}/productos/${id}`, { method: 'DELETE' });
        setMensaje('✅ Producto eliminado');
        cargarProductos();
        setTimeout(() => setMensaje(''), 3000);
      } catch (err) {
        setMensaje(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package size={28} />
          Gestión de Productos
        </h2>
        <button
          onClick={() => {
            setMostrarForm(!mostrarForm);
            setEditar(null);
            setFormData({
              codigo: '', nombre: '', categoria: 'Limpieza general',
              precio_costo: '', precio_venta: '', stock_actual: '',
              stock_minimo: '', proveedor: ''
            });
          }}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {mensaje && (
        <div className={`p-4 rounded ${mensaje.includes('Error') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
          {mensaje}
        </div>
      )}

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{editar ? 'Editar' : 'Nuevo'} Producto</h3>
            <button
              onClick={() => {
                setMostrarForm(false);
                setEditar(null);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="codigo"
              placeholder="Código"
              value={formData.codigo}
              onChange={handleChange}
              className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
              required
            />
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
              required
            />
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            >
              <option value="Limpieza general">Limpieza general</option>
              <option value="Lavado">Lavado</option>
              <option value="Superficies">Superficies</option>
              <option value="Otra">Otra</option>
            </select>
            <input
              type="number"
              name="precio_costo"
              placeholder="Precio Costo"
              value={formData.precio_costo}
              onChange={handleChange}
              step="0.01"
              className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            />
            <input
              type="number"
              name="precio_venta"
              placeholder="Precio Venta"
              value={formData.precio_venta}
              onChange={handleChange}
              step="0.01"
              className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
              required
            />
            <input
              type="number"
              name="stock_actual"
              placeholder="Stock Actual"
              value={formData.stock_actual}
              onChange={handleChange}
              className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            />
            <input
              type="number"
              name="stock_minimo"
              placeholder="Stock Mínimo"
              value={formData.stock_minimo}
              onChange={handleChange}
              className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            />
            <input
              type="text"
              name="proveedor"
              placeholder="Proveedor"
              value={formData.proveedor}
              onChange={handleChange}
              className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            />

            <button
              type="submit"
              className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
            >
              {editar ? 'Actualizar' : 'Crear'} Producto
            </button>
          </form>
        </div>
      )}

      {/* Tabla de productos */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-300 border-b border-slate-600">
            <tr>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2">Precio Venta</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {productos.map(prod => (
              <tr key={prod.id} className="hover:bg-slate-700/50">
                <td className="px-4 py-3 text-white">{prod.codigo}</td>
                <td className="px-4 py-3 text-white">{prod.nombre}</td>
                <td className="px-4 py-3 text-slate-400">{prod.categoria}</td>
                <td className="px-4 py-3 text-green-400">${prod.precio_venta.toFixed(2)}</td>
                <td className={`px-4 py-3 font-bold ${prod.stock_actual < prod.stock_minimo ? 'text-red-400' : 'text-white'}`}>
                  {prod.stock_actual}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleEditar(prod)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleEliminar(prod.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Productos;
