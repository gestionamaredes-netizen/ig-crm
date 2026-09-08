import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, StatCard } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { mockVentas, mockProductos } from '../data/mockData';
import { formatCurrency, formatDate, formatTime } from '../utils/format';

export const Ventas: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [ventas, setVentas] = useState(mockVentas);
  const [form, setForm] = useState({
    producto_id: '',
    cantidad: '',
    metodo_pago: 'EFECTIVO',
  });

  const handleAddVenta = () => {
    if (!form.producto_id || !form.cantidad) return;

    const producto = mockProductos.find((p) => p.id === form.producto_id);
    if (!producto) return;

    const nuevaVenta = {
      id: Date.now().toString(),
      fecha: new Date(),
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      producto_id: form.producto_id,
      cantidad: parseInt(form.cantidad),
      precio_unitario: producto.precio_venta,
      monto_total: producto.precio_venta * parseInt(form.cantidad),
      metodo_pago: form.metodo_pago as any,
    };

    setVentas([nuevaVenta, ...ventas]);
    setForm({ producto_id: '', cantidad: '', metodo_pago: 'EFECTIVO' });
    setShowModal(false);
  };

  const handleDeleteVenta = (id: string) => {
    setVentas(ventas.filter((v) => v.id !== id));
  };

  const totalVentas = ventas.reduce((sum, v) => sum + v.monto_total, 0);
  const cantidadVentas = ventas.length;

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Registro de Ventas</h1>
        <Button variant="success" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Nueva Venta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <StatCard
          icon={<span>📊</span>}
          label="Ticket Promedio"
          value={formatCurrency(cantidadVentas > 0 ? totalVentas / cantidadVentas : 0)}
          color="purple"
        />
      </div>

      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
          Ventas del Día
        </h3>
        <Table
          data={ventas.map((v) => ({
            hora: v.hora,
            producto: mockProductos.find((p) => p.id === v.producto_id)?.nombre || 'N/A',
            cantidad: v.cantidad,
            unitario: formatCurrency(v.precio_unitario),
            total: formatCurrency(v.monto_total),
            metodo: v.metodo_pago,
            id: v.id,
          }))}
          columns={[
            { key: 'hora', label: 'Hora' },
            { key: 'producto', label: 'Producto' },
            { key: 'cantidad', label: 'Cantidad' },
            { key: 'unitario', label: 'Unitario' },
            { key: 'total', label: 'Total' },
            { key: 'metodo', label: 'Método' },
            {
              key: 'id',
              label: 'Acción',
              render: (value) => (
                <button
                  onClick={() => handleDeleteVenta(value)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Registrar Nueva Venta"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleAddVenta} disabled={!form.producto_id || !form.cantidad}>
              Registrar Venta
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Producto"
            value={form.producto_id}
            onChange={(e) => setForm({ ...form, producto_id: e.target.value })}
            options={[
              { value: '', label: 'Seleccionar producto...' },
              ...mockProductos.map((p) => ({
                value: p.id,
                label: `${p.nombre} - Stock: ${p.stock_actual}`,
              })),
            ]}
          />
          <Input
            type="number"
            label="Cantidad"
            min="1"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            placeholder="0"
          />
          <Select
            label="Método de Pago"
            value={form.metodo_pago}
            onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}
            options={[
              { value: 'EFECTIVO', label: 'Efectivo' },
              { value: 'TARJETA', label: 'Tarjeta' },
              { value: 'CHEQUE', label: 'Cheque' },
              { value: 'TRANSFERENCIA', label: 'Transferencia' },
            ]}
          />
          {form.producto_id && form.cantidad && (
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-300">Total de Venta</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(
                  (mockProductos.find((p) => p.id === form.producto_id)?.precio_venta || 0) *
                  parseInt(form.cantidad || '0')
                )}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
