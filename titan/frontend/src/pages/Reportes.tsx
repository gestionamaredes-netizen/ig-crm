import React, { useState } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import { Card, StatCard } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockVentas, mockProductos } from '../data/mockData';
import { formatCurrency } from '../utils/format';

const ventasPorDia = [
  { dia: 'Lun', ventas: 2400 },
  { dia: 'Mar', ventas: 1800 },
  { dia: 'Mié', ventas: 3200 },
  { dia: 'Jue', ventas: 2900 },
  { dia: 'Vie', ventas: 3600 },
  { dia: 'Sáb', ventas: 4200 },
  { dia: 'Dom', ventas: 2800 },
];

export const Reportes: React.FC = () => {
  const [reportType, setReportType] = useState('ventas');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const totalVentas = mockVentas.reduce((sum, v) => sum + v.monto_total, 0);
  const cantidadVentas = mockVentas.length;

  const handleExport = () => {
    const csv = 'Fecha,Producto,Cantidad,Total\n' +
      mockVentas.map(v => {
        const producto = mockProductos.find(p => p.id === v.producto_id);
        return `${v.fecha},${producto?.nombre},${v.cantidad},${v.monto_total}`;
      }).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_ventas.csv';
    a.click();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reportes</h1>

      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
          Generador de Reportes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select
            label="Tipo de Reporte"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'ventas', label: 'Ventas' },
              { value: 'stock', label: 'Stock' },
              { value: 'clientes', label: 'Clientes' },
              { value: 'ganancias', label: 'Ganancias' },
            ]}
          />
          <Input
            type="date"
            label="Desde"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="Hasta"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-end">
            <Button variant="success" onClick={handleExport} className="w-full">
              <Download size={20} /> Descargar CSV
            </Button>
          </div>
        </div>
      </Card>

      {reportType === 'ventas' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              icon={<span>💰</span>}
              label="Total Vendido"
              value={formatCurrency(totalVentas)}
              color="green"
            />
            <StatCard
              icon={<span>🛒</span>}
              label="Número de Ventas"
              value={cantidadVentas}
              color="blue"
            />
          </div>

          <Card>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
              Ventas Últimos 7 Días
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="ventas" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      {reportType === 'stock' && (
        <Card>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
            Estado del Stock
          </h3>
          <div className="space-y-4">
            {mockProductos.map((p) => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{p.nombre}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{p.categoria}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${p.stock_actual < p.stock_minimo ? 'text-red-600' : 'text-green-600'}`}>
                    {p.stock_actual} unidades
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Mín: {p.stock_minimo}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {reportType === 'ganancias' && (
        <Card>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
            Análisis de Ganancias
          </h3>
          <div className="space-y-3">
            {mockProductos.slice(0, 5).map((p) => {
              const ganancia = p.precio_venta - p.precio_costo;
              const margen = (ganancia / p.precio_venta) * 100;
              return (
                <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{p.nombre}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Margen: {margen.toFixed(1)}%</p>
                  </div>
                  <p className="font-semibold text-green-600">{formatCurrency(ganancia)} por venta</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
