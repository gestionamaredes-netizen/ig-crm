import React from 'react';
import { AlertCircle, TrendingDown } from 'lucide-react';
import { Card, StatCard } from '../components/Card';
import { Table } from '../components/Table';
import { mockProductos } from '../data/mockData';
import { formatCurrency, formatNumber } from '../utils/format';

export const Stock: React.FC = () => {
  const productosAlerta = mockProductos.filter((p) => p.stock_actual < p.stock_minimo);
  const totalProductos = mockProductos.length;
  const totalStock = mockProductos.reduce((sum, p) => sum + p.stock_actual, 0);
  const valorStock = mockProductos.reduce((sum, p) => sum + p.stock_actual * p.precio_costo, 0);

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Stock</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<span>📦</span>}
          label="Total de Productos"
          value={formatNumber(totalProductos)}
          color="blue"
        />
        <StatCard
          icon={<span>📊</span>}
          label="Stock Total"
          value={formatNumber(totalStock)}
          color="green"
        />
        <StatCard
          icon={<span>💰</span>}
          label="Valor del Stock"
          value={formatCurrency(valorStock)}
          color="purple"
        />
        <StatCard
          icon={<AlertCircle className="text-red-600" />}
          label="Productos en Alerta"
          value={formatNumber(productosAlerta.length)}
          color="red"
          trend={{ value: productosAlerta.length > 0 ? 100 : 0, isPositive: false }}
        />
      </div>

      {productosAlerta.length > 0 && (
        <Card className="border-l-4 border-red-400 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                Stock Crítico Detectado
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300">
                {productosAlerta.length} producto(s) con stock por debajo del nivel mínimo
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
          Inventario General
        </h3>
        <Table
          data={mockProductos.map((p) => ({
            ...p,
            stock_valor: formatCurrency(p.stock_actual * p.precio_costo),
            precio_venta: formatCurrency(p.precio_venta),
            precio_costo: formatCurrency(p.precio_costo),
            alerta: p.stock_actual < p.stock_minimo ? '⚠️' : '✓',
          }))}
          columns={[
            { key: 'codigo', label: 'Código', width: 'w-1/6' },
            { key: 'nombre', label: 'Producto', width: 'w-2/6' },
            { key: 'stock_actual', label: 'Stock Actual', width: 'w-1/6' },
            { key: 'stock_minimo', label: 'Stock Mín.', width: 'w-1/12' },
            { key: 'alerta', label: 'Estado', width: 'w-1/12' },
            { key: 'stock_valor', label: 'Valor', width: 'w-1/6' },
          ]}
        />
      </Card>

      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
          Productos en Alerta
        </h3>
        {productosAlerta.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-center py-8">
            Todos los productos tienen stock disponible
          </p>
        ) : (
          <Table
            data={productosAlerta.map((p) => ({
              ...p,
              faltante: p.stock_minimo - p.stock_actual,
              precio_venta: formatCurrency(p.precio_venta),
            }))}
            columns={[
              { key: 'nombre', label: 'Producto', width: 'w-2/5' },
              { key: 'stock_actual', label: 'Stock Actual', width: 'w-1/5' },
              { key: 'stock_minimo', label: 'Stock Mín.', width: 'w-1/5' },
              { key: 'faltante', label: 'Faltante', width: 'w-1/5' },
            ]}
          />
        )}
      </Card>
    </div>
  );
};
