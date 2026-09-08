import React, { useState, useEffect } from 'react';
import { BarChart3, Download } from 'lucide-react';

function Reportes({ apiUrl }) {
  const [fechaInicio, setFechaInicio] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const [ventasRes, productosRes] = await Promise.all([
        fetch(`${apiUrl}/ventas`),
        fetch(`${apiUrl}/productos`)
      ]);

      let ventasData = await ventasRes.json();
      const productosData = await productosRes.json();

      ventasData = ventasData.filter(v => v.fecha >= fechaInicio && v.fecha <= fechaFin);

      setVentas(ventasData);
      setProductos(productosData);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const totalVentas = ventas.reduce((sum, v) => sum + v.monto_total, 0);
  const cantidadVentas = ventas.length;
  const ventasPromedio = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;

  const ventasPorProducto = {};
  ventas.forEach(v => {
    if (!ventasPorProducto[v.nombre]) {
      ventasPorProducto[v.nombre] = { cantidad: 0, monto: 0 };
    }
    ventasPorProducto[v.nombre].cantidad += v.cantidad;
    ventasPorProducto[v.nombre].monto += v.monto_total;
  });

  const topProductos = Object.entries(ventasPorProducto)
    .sort((a, b) => b[1].monto - a[1].monto)
    .slice(0, 10);

  const ventasPorMetodo = {};
  ventas.forEach(v => {
    if (!ventasPorMetodo[v.metodo_pago]) {
      ventasPorMetodo[v.metodo_pago] = 0;
    }
    ventasPorMetodo[v.metodo_pago] += v.monto_total;
  });

  const exportarCSV = () => {
    let csv = 'Fecha,Hora,Producto,Cantidad,Precio Unitario,Monto Total,Método Pago\n';
    ventas.forEach(v => {
      csv += `${v.fecha},${v.hora},${v.nombre},${v.cantidad},${v.precio_unitario},${v.monto_total},${v.metodo_pago}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-ventas-${fechaInicio}-${fechaFin}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <BarChart3 size={28} />
        Reportes
      </h2>

      {/* Filtros */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={cargarReportes}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
            >
              Filtrar
            </button>
            <button
              onClick={exportarCSV}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded flex items-center gap-2"
            >
              <Download size={20} />
              Descargar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 text-white">
          <p className="text-blue-100 text-sm">Total Ventas</p>
          <p className="text-2xl font-bold">${totalVentas.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 text-white">
          <p className="text-green-100 text-sm">Cantidad de Ventas</p>
          <p className="text-2xl font-bold">{cantidadVentas}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 text-white">
          <p className="text-purple-100 text-sm">Venta Promedio</p>
          <p className="text-2xl font-bold">${ventasPromedio.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4 text-white">
          <p className="text-orange-100 text-sm">Productos</p>
          <p className="text-2xl font-bold">{productos.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Productos */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Top Productos</h3>
          {topProductos.length === 0 ? (
            <p className="text-slate-400">Sin ventas en este período</p>
          ) : (
            <div className="space-y-3">
              {topProductos.map(([nombre, datos], idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-700/50 p-3 rounded">
                  <div>
                    <p className="text-white font-medium">{nombre}</p>
                    <p className="text-slate-400 text-sm">{datos.cantidad} unidades</p>
                  </div>
                  <p className="text-green-400 font-bold">${datos.monto.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ventas por Método de Pago */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Ventas por Método de Pago</h3>
          {Object.keys(ventasPorMetodo).length === 0 ? (
            <p className="text-slate-400">Sin ventas en este período</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(ventasPorMetodo).map(([metodo, monto], idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-700/50 p-3 rounded">
                  <p className="text-white font-medium">{metodo}</p>
                  <p className="text-green-400 font-bold">${monto.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Listado de Ventas */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 overflow-x-auto">
        <h3 className="text-xl font-bold text-white mb-4">Detalle de Ventas</h3>
        {loading ? (
          <p className="text-slate-400">Cargando...</p>
        ) : ventas.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Sin ventas en este período</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-slate-300 border-b border-slate-600">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Precio Unit.</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Método</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {ventas.map((venta, idx) => (
                <tr key={idx} className="hover:bg-slate-700/50">
                  <td className="px-4 py-3 text-white">{venta.fecha}</td>
                  <td className="px-4 py-3 text-white">{venta.nombre}</td>
                  <td className="px-4 py-3 text-white">{venta.cantidad}</td>
                  <td className="px-4 py-3 text-white">${venta.precio_unitario.toFixed(2)}</td>
                  <td className="px-4 py-3 text-green-400 font-bold">${venta.monto_total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-400">{venta.metodo_pago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reportes;
