import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, Package, DollarSign } from 'lucide-react';

function Dashboard({ datos, apiUrl }) {
  const [ventasUltimos7Dias, setVentasUltimos7Dias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarVentasUltimos7Dias();
  }, []);

  const cargarVentasUltimos7Dias = async () => {
    try {
      const response = await fetch(`${apiUrl}/ventas`);
      const ventas = await response.json();

      const últimos7Días = {};
      const hoy = new Date();

      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0];
        últimos7Días[fechaStr] = 0;
      }

      ventas.forEach(venta => {
        if (últimos7Días.hasOwnProperty(venta.fecha)) {
          últimos7Días[venta.fecha] += venta.monto_total;
        }
      });

      const datos = Object.entries(últimos7Días).map(([fecha, total]) => ({
        fecha: new Date(fecha).toLocaleDateString('es-AR', { weekday: 'short', month: 'short', day: 'numeric' }),
        total: parseFloat(total.toFixed(2))
      }));

      setVentasUltimos7Dias(datos);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando dashboard...</div>;
  }

  const totalHoy = datos?.dashboard?.ventasHoy || 0;
  const alertasStock = datos?.dashboard?.alertasStock || 0;
  const topProductos = datos?.dashboard?.topProductos || [];

  const COLORS = ['#00d94f', '#0066cc', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Ventas Hoy</p>
              <p className="text-3xl font-bold">${totalHoy.toFixed(2)}</p>
            </div>
            <DollarSign size={48} className="opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Productos</p>
              <p className="text-3xl font-bold">{datos?.productos?.length || 0}</p>
            </div>
            <Package size={48} className="opacity-20" />
          </div>
        </div>

        <div className={`bg-gradient-to-br ${alertasStock > 0 ? 'from-red-500 to-red-600' : 'from-orange-500 to-orange-600'} rounded-lg p-6 text-white shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={alertasStock > 0 ? 'text-red-100 text-sm' : 'text-orange-100 text-sm'}>Alertas Stock</p>
              <p className="text-3xl font-bold">{alertasStock}</p>
            </div>
            <AlertTriangle size={48} className="opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Trending</p>
              <p className="text-3xl font-bold">{topProductos.length}+</p>
            </div>
            <TrendingUp size={48} className="opacity-20" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas últimos 7 días */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Ventas - Últimos 7 Días</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasUltimos7Dias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="fecha" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Line type="monotone" dataKey="total" stroke="#00d94f" strokeWidth={3} dot={{ fill: '#00d94f', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Productos */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Top Productos Hoy</h3>
          {topProductos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="nombre" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Bar dataKey="cantidad_vendida" fill="#00d94f" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-8">Sin ventas registradas hoy</p>
          )}
        </div>
      </div>

      {/* Alertas de Stock */}
      {datos?.dashboard?.productosAlerta?.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={24} />
            Productos con Stock Bajo
          </h3>
          <div className="space-y-2">
            {datos.dashboard.productosAlerta.map((prod, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                <span className="text-white">{prod.nombre}</span>
                <span className="text-red-400 font-bold">Stock: {prod.stock_actual} / Min: {prod.stock_minimo}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
