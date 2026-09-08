import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { mockClientes } from '../data/mockData';

export const Clientes: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [clientes, setClientes] = useState(mockClientes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
  });

  const handleOpenModal = (cliente?: any) => {
    if (cliente) {
      setEditingId(cliente.id);
      setForm(cliente);
    } else {
      setEditingId(null);
      setForm({
        nombre: '',
        dni: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        provincia: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nombre) return;

    if (editingId) {
      setClientes(
        clientes.map((c) => (c.id === editingId ? { ...c, ...form } : c))
      );
    } else {
      setClientes([
        ...clientes,
        { id: Date.now().toString(), ...form, activo: true },
      ]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setClientes(clientes.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Clientes</h1>
        <Button variant="success" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nuevo Cliente
        </Button>
      </div>

      <Card>
        <Table
          data={clientes.map((c) => ({
            ...c,
            estado: c.activo ? 'Activo' : 'Inactivo',
          }))}
          columns={[
            { key: 'nombre', label: 'Nombre', width: 'w-1/4' },
            { key: 'email', label: 'Email', width: 'w-1/4' },
            { key: 'telefono', label: 'Teléfono', width: 'w-1/6' },
            { key: 'ciudad', label: 'Ciudad', width: 'w-1/6' },
            {
              key: 'estado',
              label: 'Estado',
              width: 'w-1/12',
              render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {value}
                </span>
              ),
            },
            {
              key: 'id',
              label: 'Acciones',
              width: 'w-1/12',
              render: (value) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(clientes.find((c) => c.id === value))}
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
        title={editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
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
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Nombre completo"
          />
          <Input
            label="DNI"
            value={form.dni}
            onChange={(e) => setForm({ ...form, dni: e.target.value })}
            placeholder="20123456789"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="cliente@email.com"
          />
          <Input
            label="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="1123456789"
          />
          <Input
            label="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            placeholder="Calle 123"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
              placeholder="Buenos Aires"
            />
            <Input
              label="Provincia"
              value={form.provincia}
              onChange={(e) => setForm({ ...form, provincia: e.target.value })}
              placeholder="CABA"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
