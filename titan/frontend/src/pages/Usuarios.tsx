import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Lock } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { mockUsuarios } from '../data/mockData';

export const Usuarios: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [usuarios, setUsuarios] = useState(mockUsuarios);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    rol: 'vendedor',
  });

  const handleOpenModal = (usuario?: any) => {
    if (usuario) {
      setEditingId(usuario.id);
      setForm({ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
    } else {
      setEditingId(null);
      setForm({ nombre: '', email: '', rol: 'vendedor' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nombre || !form.email) return;

    const usuarioData = {
      nombre: form.nombre,
      email: form.email,
      rol: form.rol as 'admin' | 'vendedor' | 'gerente',
    };

    if (editingId) {
      setUsuarios(
        usuarios.map((u) => (u.id === editingId ? { ...u, ...usuarioData } : u))
      );
    } else {
      setUsuarios([
        ...usuarios,
        { id: Date.now().toString(), ...usuarioData, activo: true },
      ]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setUsuarios(usuarios.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Usuarios</h1>
        <Button variant="success" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nuevo Usuario
        </Button>
      </div>

      <Card>
        <Table
          data={usuarios.map((u) => ({
            ...u,
            estado: u.activo ? 'Activo' : 'Inactivo',
            rolLabel: u.rol === 'admin' ? 'Administrador' : u.rol === 'gerente' ? 'Gerente' : 'Vendedor',
          }))}
          columns={[
            { key: 'nombre', label: 'Nombre', width: 'w-1/3' },
            { key: 'email', label: 'Email', width: 'w-1/3' },
            { key: 'rolLabel', label: 'Rol', width: 'w-1/6' },
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
              width: 'w-1/6',
              render: (value) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(usuarios.find((u) => u.id === value))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <Lock size={18} />
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
        title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
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
            label="Nombre Completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Juan García"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="usuario@titan.local"
          />
          <Select
            label="Rol"
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
            options={[
              { value: 'vendedor', label: 'Vendedor' },
              { value: 'gerente', label: 'Gerente' },
              { value: 'admin', label: 'Administrador' },
            ]}
          />
        </div>
      </Modal>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Cambiar Contraseña"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button variant="success">Guardar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            type="password"
            label="Contraseña Actual"
            placeholder="••••••••"
          />
          <Input
            type="password"
            label="Nueva Contraseña"
            placeholder="••••••••"
          />
          <Input
            type="password"
            label="Confirmar Contraseña"
            placeholder="••••••••"
          />
        </div>
      </Modal>
    </div>
  );
};
