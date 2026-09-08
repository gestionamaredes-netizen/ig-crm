import React, { useState, useEffect } from 'react';
import { mockProductos, mockVentas } from '../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Sale {
  id: string;
  producto: string;
  precio: number;
  cantidad: number;
  medioPago: 'efectivo' | 'tarjeta' | 'cheque';
  hora: string;
}

export const VendorDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openTime, setOpenTime] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'cheque'>('efectivo');
  const [customPrice, setCustomPrice] = useState('');

  const handleOpenBusiness = () => {
    if (!isOpen) {
      setOpenTime(format(new Date(), 'HH:mm'));
      setIsOpen(true);
      setSales([]);
    }
  };

  const handleCloseBusiness = () => {
    setIsOpen(false);
  };

  const handleAddSale = () => {
    if (!selectedProduct || !quantity) return;

    const product = mockProductos.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;

    const price = customPrice ? parseFloat(customPrice) : product.precio_venta;
    const qty = parseInt(quantity);

    const newSale: Sale = {
      id: Date.now().toString(),
      producto: product.nombre,
      precio: price,
      cantidad: qty,
      medioPago: paymentMethod,
      hora: format(new Date(), 'HH:mm:ss'),
    };

    setSales([...sales, newSale]);
    setSelectedProduct('');
    setQuantity('1');
    setCustomPrice('');
  };

  const handleDeleteSale = (id: string) => {
    setSales(sales.filter(s => s.id !== id));
  };

  const totalCash = sales
    .filter(s => s.medioPago === 'efectivo')
    .reduce((sum, s) => sum + (s.precio * s.cantidad), 0);

  const totalCard = sales
    .filter(s => s.medioPago === 'tarjeta')
    .reduce((sum, s) => sum + (s.precio * s.cantidad), 0);

  const totalCheck = sales
    .filter(s => s.medioPago === 'cheque')
    .reduce((sum, s) => sum + (s.precio * s.cantidad), 0);

  const totalSales = totalCash + totalCard + totalCheck;
  const totalItems = sales.reduce((sum, s) => sum + s.cantidad, 0);

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🛍️ Venta del Día</h1>
            <p className="text-blue-100">
              {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
            </p>
            {isOpen && (
              <p className="text-blue-200 mt-2">
                Negocio abierto desde las {openTime}
              </p>
            )}
          </div>
          <div className="text-right">
            {isOpen ? (
              <button
                onClick={handleCloseBusiness}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
              >
                🔴 Cerrar Negocio
              </button>
            ) : (
              <button
                onClick={handleOpenBusiness}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
              >
                🟢 Abrir Negocio
              </button>
            )}
          </div>
        </div>
      </div>

      {!isOpen ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-8 text-center">
          <p className="text-amber-900 text-lg font-semibold">
            ⚠️ El negocio está cerrado. Haz clic en "Abrir Negocio" para comenzar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de Venta */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">➕ Registrar Venta</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Producto
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="">Selecciona un producto</option>
                    {mockProductos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} - ${p.precio_venta}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Precio (opcional - deja en blanco para precio base)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Precio personalizado"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Medio de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta">💳 Tarjeta</option>
                    <option value="cheque">✓ Cheque</option>
                  </select>
                </div>

                <button
                  onClick={handleAddSale}
                  disabled={!selectedProduct}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
                >
                  ✓ Agregar Venta
                </button>
              </div>
            </div>
          </div>

          {/* Resumen y Listado de Ventas */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs text-blue-100 mb-1">VENTAS TOTAL</p>
                <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs text-emerald-100 mb-1">EFECTIVO</p>
                <p className="text-2xl font-bold">${totalCash.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs text-indigo-100 mb-1">TARJETA</p>
                <p className="text-2xl font-bold">${totalCard.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs text-orange-100 mb-1">CHEQUE</p>
                <p className="text-2xl font-bold">${totalCheck.toFixed(2)}</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs text-pink-100 mb-1">PRODUCTOS</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs text-cyan-100 mb-1">TRANSACCIONES</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
            </div>

            {/* Tabla de Ventas */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4">
                <h3 className="font-bold text-lg">📋 Historial de Ventas</h3>
              </div>

              {sales.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="text-lg">No hay ventas registradas aún</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Hora</th>
                        <th className="px-4 py-3 text-left font-semibold">Producto</th>
                        <th className="px-4 py-3 text-right font-semibold">Cantidad</th>
                        <th className="px-4 py-3 text-right font-semibold">Precio</th>
                        <th className="px-4 py-3 text-right font-semibold">Total</th>
                        <th className="px-4 py-3 text-center font-semibold">Pago</th>
                        <th className="px-4 py-3 text-center font-semibold">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map(sale => (
                        <tr key={sale.id} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3">{sale.hora}</td>
                          <td className="px-4 py-3 font-semibold">{sale.producto}</td>
                          <td className="px-4 py-3 text-right">{sale.cantidad}</td>
                          <td className="px-4 py-3 text-right">${sale.precio.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold">
                            ${(sale.precio * sale.cantidad).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {sale.medioPago === 'efectivo' && '💵'}
                            {sale.medioPago === 'tarjeta' && '💳'}
                            {sale.medioPago === 'cheque' && '✓'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteSale(sale.id)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
