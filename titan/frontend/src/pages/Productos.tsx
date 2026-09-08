import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { mockProductos, mockCategorias } from '../data/mockData';
import { formatCurrency } from '../utils/format';

export const Productos: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [productos, setProductos] = useState(mockProductos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    precio_costo: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
    proveedor: '',
  });

  const handleOpenModal = (producto?: any) => {
    if (producto) {
      setEditingId(producto.id);
      setForm(producto);
    } else {
      setEditingId(null);
      setForm({
        codigo: '',
        nombre: '',
        categoria: '',
        precio_costo: '',
        precio_venta: '',
        stock_actual: '',
        stock_minimo: '',
        proveedor: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nombre || !form.categoria || !form.precio_venta) return;

    const productoData = {
      codigo: form.codigo,
      nombre: form.nombre,
      descripcion: '',
      categoria: form.categoria,
      precio_costo: parseFloat(form.precio_costo) || 0,
      precio_venta: parseFloat(form.precio_venta) || 0,
      stock_actual: parseInt(form.stock_actual) || 0,
      stock_minimo: parseInt(form.stock_minimo) || 5,
      proveedor: form.proveedor,
    };

    if (editingId) {
      setProductos(
        productos.map((p) =>
          p.id === editingId
            ? { ...p, ...productoData }
            : p
        )
      );
    } else {
      setProductos([
        ...productos,
        {
          id: Date.now().toString(),
          ...productoData,
          creado_en: new Date(),
        },
      ]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setProductos(productos.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Productos</h1>
        <Button variant="success" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nuevo Producto
        </Button>
      </div>

      <Card>
        <Table
          data={productos.map((p) => ({
            ...p,
            precio_venta: formatCurrency(p.precio_venta),
            precio_costo: formatCurrency(p.precio_costo),
            ganancia: formatCurrency(p.precio_venta - p.precio_costo),
            margen: `${(((p.precio_venta - p.precio_costo) / p.precio_venta) * 100).toFixed(1)}%`,
          }))}
          columns={[
            { key: 'codigo', label: 'Código', width: 'w-1/8' },
            { key: 'nombre', label: 'Producto', width: 'w-2/8' },
            { key: 'categoria', label: 'Categoría', width: 'w-1/8' },
            { key: 'precio_venta', label: 'P. Venta', width: 'w-1/8' },
            { key: 'ganancia', label: 'Ganancia', width: 'w-1/8' },
            { key: 'stock_actual', label: 'Stock', width: 'w-1/12' },
            {
              key: 'id',
              label: 'Acciones',
              width: 'w-1/8',
              render: (value) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(productos.find((p) => p.id === value))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(value)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Editar Producto' : 'Nuevo Producto'}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleSave}>
              {editingId ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <Input
            label="Código"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            placeholder="LG-001"
          />
          <Input
            label="Nombre del Producto"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Detergente Líquido"
          />
          <Select
            label="Categoría"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            options={[
              { value: '', label: 'Seleccionar categoría...' },
              ...mockCategorias.map((c) => ({ value: c.nombre, label: c.nombre })),
            ]}
          />
          <Input
            label="Proveedor"
            value={form.proveedor}
            onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
            placeholder="Química del Sur"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Precio Costo"
              step="0.01"
              value={form.precio_costo}
              onChange={(e) => setForm({ ...form, precio_costo: e.target.value })}
              placeholder="0.00"
            />
            <Input
              type="number"
              label="Precio Venta"
              step="0.01"
              value={form.precio_venta}
              onChange={(e) => setForm({ ...form, precio_venta: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Stock Actual"
              value={form.stock_actual}
              onChange={(e) => setForm({ ...form, stock_actual: e.target.value })}
              placeholder="0"
            />
            <Input
              type="number"
              label="Stock Mínimo"
              value={form.stock_minimo}
              onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
              placeholder="5"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
