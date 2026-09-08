import React, { useState } from 'react';
import { mockProductos, mockCategorias } from '../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type AdminSection = 'dashboard' | 'stock' | 'precios' | 'categorias';

export const AdminDashboard: React.FC = () => {
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [products, setProducts] = useState(mockProductos);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio_costo: 0,
    precio_venta: 0,
    stock_actual: 0,
    stock_minimo: 0,
  });

  const handleEditProduct = (product: typeof mockProductos[0]) => {
    setEditingProduct(product.id);
    setFormData({
      nombre: product.nombre,
      precio_costo: product.precio_costo,
      precio_venta: product.precio_venta,
      stock_actual: product.stock_actual,
      stock_minimo: product.stock_minimo,
    });
  };

  const handleSaveProduct = (id: string) => {
    setProducts(products.map(p =>
      p.id === id
        ? { ...p, ...formData }
        : p
    ));
    setEditingProduct(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      precio_costo: 0,
      precio_venta: 0,
      stock_actual: 0,
      stock_minimo: 0,
    });
  };

  const lowStockProducts = products.filter(p => p.stock_actual <= p.stock_minimo);
  const totalValue = products.reduce((sum, p) => sum + (p.stock_actual * p.precio_venta), 0);
  const totalCostValue = products.reduce((sum, p) => sum + (p.stock_actual * p.precio_costo), 0);
  const potentialProfit = totalValue - totalCostValue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">👑 Panel de Administrador</h1>
        <p className="text-blue-100">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
          { id: 'stock', label: '📦 Control de Stock', icon: '📦' },
          { id: 'precios', label: '💰 Gestionar Precios', icon: '💰' },
          { id: 'categorias', label: '🏷️ Categorías', icon: '🏷️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSection(tab.id as AdminSection)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              section === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard View */}
      {section === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-sm text-blue-100 mb-2">Valor Total de Stock</p>
              <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
              <p className="text-xs text-blue-200 mt-2">Precio de venta</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-sm text-emerald-100 mb-2">Costo Total Stock</p>
              <p className="text-3xl font-bold">${totalCostValue.toFixed(2)}</p>
              <p className="text-xs text-emerald-200 mt-2">Precio de costo</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-sm text-purple-100 mb-2">Ganancia Potencial</p>
              <p className="text-3xl font-bold">${potentialProfit.toFixed(2)}</p>
              <p className="text-xs text-purple-200 mt-2">Diferencia de margen</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-sm text-orange-100 mb-2">Productos Bajo Stock</p>
              <p className="text-3xl font-bold">{lowStockProducts.length}</p>
              <p className="text-xs text-orange-200 mt-2">Requieren reorden</p>
            </div>
          </div>

          {/* Alertas de Stock Bajo */}
          {lowStockProducts.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-900 mb-4">⚠️ Productos con Stock Bajo</h3>
              <div className="space-y-3">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between bg-white rounded-lg p-4 border border-red-200">
                    <div>
                      <p className="font-semibold text-slate-900">{product.nombre}</p>
                      <p className="text-sm text-slate-600">Stock: {product.stock_actual} / Mínimo: {product.stock_minimo}</p>
                    </div>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                      Reordenar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stock Control View */}
      {section === 'stock' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
            <h2 className="text-2xl font-bold">📦 Control de Inventario</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Producto</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">Stock Actual</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">Stock Mínimo</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">Precio Costo</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">Acción</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {editingProduct === product.id ? (
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      ) : (
                        product.nombre
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          value={formData.stock_actual}
                          onChange={(e) => setFormData({ ...formData, stock_actual: parseInt(e.target.value) })}
                          className="w-20 px-2 py-1 border rounded text-right"
                        />
                      ) : (
                        <span className={`font-bold ${product.stock_actual <= product.stock_minimo ? 'text-red-600' : 'text-green-600'}`}>
                          {product.stock_actual}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          value={formData.stock_minimo}
                          onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) })}
                          className="w-20 px-2 py-1 border rounded text-right"
                        />
                      ) : (
                        product.stock_minimo
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={formData.precio_costo}
                          onChange={(e) => setFormData({ ...formData, precio_costo: parseFloat(e.target.value) })}
                          className="w-24 px-2 py-1 border rounded text-right"
                        />
                      ) : (
                        `$${product.precio_costo.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {editingProduct === product.id ? (
                        <>
                          <button
                            onClick={() => handleSaveProduct(product.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-semibold text-sm"
                          >
                            ✓ Guardar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded font-semibold text-sm"
                          >
                            ✕ Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded font-semibold text-sm"
                        >
                          ✎ Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Precios View */}
      {section === 'precios' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
            <h2 className="text-2xl font-bold">💰 Gestión de Precios y Márgenes</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Producto</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">Precio Costo</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">Precio Venta</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">Margen %</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">Ganancia</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900">Acción</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const margin = ((product.precio_venta - product.precio_costo) / product.precio_costo * 100).toFixed(2);
                  const profit = (product.precio_venta - product.precio_costo).toFixed(2);
                  return (
                    <tr key={product.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {editingProduct === product.id ? (
                          <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          product.nombre
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingProduct === product.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={formData.precio_costo}
                            onChange={(e) => setFormData({ ...formData, precio_costo: parseFloat(e.target.value) })}
                            className="w-24 px-2 py-1 border rounded text-right"
                          />
                        ) : (
                          `$${product.precio_costo.toFixed(2)}`
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600">
                        {editingProduct === product.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={formData.precio_venta}
                            onChange={(e) => setFormData({ ...formData, precio_venta: parseFloat(e.target.value) })}
                            className="w-24 px-2 py-1 border rounded text-right"
                          />
                        ) : (
                          `$${product.precio_venta.toFixed(2)}`
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 font-bold">{margin}%</td>
                      <td className="px-6 py-4 text-right text-green-600 font-bold">${profit}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {editingProduct === product.id ? (
                          <>
                            <button
                              onClick={() => handleSaveProduct(product.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded font-semibold text-sm"
                            >
                              ✓ Guardar
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded font-semibold text-sm"
                            >
                              ✕ Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded font-semibold text-sm"
                          >
                            ✎ Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categorías View */}
      {section === 'categorias' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCategorias.map(category => {
            const categoryProducts = products.filter(p => p.categoria === category.id);
            return (
              <div key={category.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{category.nombre}</h3>
                <p className="text-3xl font-bold text-blue-600 mb-4">{categoryProducts.length}</p>
                <p className="text-sm text-slate-600 mb-4">Productos en esta categoría</p>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-all">
                  Ver Detalles
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
