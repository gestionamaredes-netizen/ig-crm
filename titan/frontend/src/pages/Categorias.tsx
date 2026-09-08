import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { mockCategorias } from '../data/mockData';

export const Categorias: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState(mockCategorias);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });

  const handleOpenModal = (cat?: any) => {
    if (cat) {
      setEditingId(cat.id);
      setForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
    } else {
      setEditingId(null);
      setForm({ nombre: '', descripcion: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nombre) return;

    if (editingId) {
      setCategorias(
        categorias.map((c) => (c.id === editingId ? { ...c, ...form } : c))
      );
    } else {
      setCategorias([
        ...categorias,
        { id: Date.now().toString(), ...form, activa: true },
      ]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setCategorias(categorias.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Categorías</h1>
        <Button variant="success" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nueva Categoría
        </Button>
      </div>

      <Card>
        <Table
          data={categorias.map((c) => ({
            ...c,
            estado: c.activa ? 'Activa' : 'Inactiva',
          }))}
          columns={[
            { key: 'nombre', label: 'Nombre', width: 'w-1/3' },
            { key: 'descripcion', label: 'Descripción', width: 'w-1/3' },
            {
              key: 'estado',
              label: 'Estado',
              width: 'w-1/6',
              render: (value) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    value === 'Activa'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {value}
                </span>
              ),
            },
            {
              key: 'id',
              label: 'Acciones',
              width: 'w-1/6',
              render: (value) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(categorias.find((c) => c.id === value))}
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
        title={editingId ? 'Editar Categoría' : 'Nueva Categoría'}
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
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: Limpieza General"
          />
          <Input
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Descripción de la categoría"
          />
        </div>
      </Modal>
    </div>
  );
};
