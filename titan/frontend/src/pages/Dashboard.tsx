import React, { useState } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Package,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, StatCard } from '../components/Card';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { mockVentas, mockProductos } from '../data/mockData';
import { formatCurrency, formatNumber } from '../utils/format';
import { subDays, format } from 'date-fns';

const chartData = [
  { dia: 'Lun', ventas: 2400, ganancia: 1200 },
  { dia: 'Mar', ventas: 1800, ganancia: 900 },
  { dia: 'Mié', ventas: 3200, ganancia: 1600 },
  { dia: 'Jue', ventas: 2900, ganancia: 1450 },
  { dia: 'Vie', ventas: 3600, ganancia: 1800 },
  { dia: 'Sáb', ventas: 4200, ganancia: 2100 },
  { dia: 'Dom', ventas: 2800, ganancia: 1400 },
];

const metodosPagoData = [
  { name: 'Efectivo', value: 35 },
  { name: 'Tarjeta', value: 40 },
  { name: 'Cheque', value: 15 },
  { name: 'Transferencia', value: 10 },
];

const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#8b5cf6'];

export const Dashboard: React.FC = () => {
  const [showAlert, setShowAlert] = useState(true);

  const totalVentas = mockVentas.reduce((sum, v) => sum + v.monto_total, 0);
  const productosAlerta = mockProductos.filter(p => p.stock_actual < p.stock_minimo);

  const ventasHoy = mockVentas.length;
  const topProductos = [
    { id: '9', nombre: 'Cloro 1L', cantidad: 4, monto: 23.96 },
    { id: '1', nombre: 'Detergente Líquido 2L', cantidad: 3, monto: 47.97 },
    { id: '5', nombre: 'Jabón de Manos 500ml', cantidad: 3, monto: 23.97 },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Bienvenido al Titán
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: require('date-fns/locale/es') })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm">Registrar Venta</Button>
          <Button variant="secondary" size="sm">Descargar Reporte</Button>
        </div>
      </div>

      {/* Alerts */}
      {showAlert && productosAlerta.length > 0 && (
        <Card className="border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                  Stock Bajo
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {productosAlerta.length} producto(s) con stock por debajo del mínimo
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
            >
              ✕
            </button>
          </div>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="text-blue-600" />}
          label="Ventas Hoy"
          value={formatCurrency(totalVentas)}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          icon={<ShoppingCart className="text-green-600" />}
          label="Transacciones"
          value={formatNumber(ventasHoy)}
          color="green"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          icon={<Package className="text-purple-600" />}
          label="Stock Total"
          value={formatNumber(
            mockProductos.reduce((sum, p) => sum + p.stock_actual, 0)
          )}
          color="purple"
        />
        <StatCard
          icon={<AlertCircle className="text-red-600" />}
          label="Alertas Stock"
          value={formatNumber(productosAlerta.length)}
          color="red"
          trend={{ value: 25, isPositive: false }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
            Ventas Últimos 7 Días
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#16a34a" strokeWidth={2} />
              <Line type="monotone" dataKey="ganancia" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
            Métodos de Pago
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metodosPagoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {metodosPagoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
            Top Productos
          </h3>
          <Table
            data={topProductos}
            columns={[
              { key: 'nombre', label: 'Producto', width: 'w-1/2' },
              { key: 'cantidad', label: 'Cant.', width: 'w-1/4' },
              {
                key: 'monto',
                label: 'Total',
                render: (value) => formatCurrency(value),
                width: 'w-1/4',
              },
            ]}
          />
        </Card>

        <Card>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
            Últimas Transacciones
          </h3>
          <Table
            data={mockVentas.slice(0, 5).map((v) => ({
              hora: v.hora,
              producto: mockProductos.find((p) => p.id === v.producto_id)?.nombre || 'N/A',
              cantidad: v.cantidad,
              total: formatCurrency(v.monto_total),
            }))}
            columns={[
              { key: 'hora', label: 'Hora', width: 'w-1/4' },
              { key: 'producto', label: 'Producto', width: 'w-1/2' },
              { key: 'cantidad', label: 'Cant.', width: 'w-1/6' },
              { key: 'total', label: 'Total', width: 'w-1/4' },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};
