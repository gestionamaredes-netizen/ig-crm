import React, { useState } from 'react';
import { Save, Bell, Moon, Globe } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';

export const Configuracion: React.FC = () => {
  const [config, setConfig] = useState({
    nombre_negocio: 'El Titán - Productos de Limpieza',
    direccion: 'Av. de Mayo 2293, Ramos Mejía',
    telefono: '1123456789',
    email: 'info@titan.local',
    timezone: 'America/Argentina/Buenos_Aires',
    idioma: 'es',
    tema: 'light',
    notificaciones_email: true,
    notificaciones_sistema: true,
    stock_minimo_alerta: '5',
    respaldar_datos: true,
  });

  const handleSave = () => {
    // Guardar configuración
    alert('Configuración guardada exitosamente');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configuración</h1>

      {/* Información del Negocio */}
      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe size={20} /> Información del Negocio
        </h3>
        <div className="space-y-4">
          <Input
            label="Nombre del Negocio"
            value={config.nombre_negocio}
            onChange={(e) => setConfig({ ...config, nombre_negocio: e.target.value })}
          />
          <Input
            label="Dirección"
            value={config.direccion}
            onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              value={config.telefono}
              onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Preferencias */}
      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Moon size={20} /> Preferencias del Sistema
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Zona Horaria"
              value={config.timezone}
              onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
              options={[
                { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)' },
                { value: 'America/Argentina/Mendoza', label: 'Mendoza' },
                { value: 'America/Argentina/Salta', label: 'Salta' },
              ]}
            />
            <Select
              label="Idioma"
              value={config.idioma}
              onChange={(e) => setConfig({ ...config, idioma: e.target.value })}
              options={[
                { value: 'es', label: 'Español (Latinoamérica)' },
                { value: 'es-AR', label: 'Español (Argentina)' },
                { value: 'en', label: 'English' },
                { value: 'pt', label: 'Português' },
              ]}
            />
          </div>
          <Select
            label="Tema"
            value={config.tema}
            onChange={(e) => setConfig({ ...config, tema: e.target.value })}
            options={[
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Oscuro' },
              { value: 'auto', label: 'Automático (según sistema)' },
            ]}
          />
        </div>
      </Card>

      {/* Notificaciones */}
      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell size={20} /> Notificaciones
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Notificaciones por Email</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Recibir alertas importantes por correo</p>
            </div>
            <input
              type="checkbox"
              checked={config.notificaciones_email}
              onChange={(e) => setConfig({ ...config, notificaciones_email: e.target.checked })}
              className="w-5 h-5"
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Notificaciones del Sistema</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Mostrar alertas en la aplicación</p>
            </div>
            <input
              type="checkbox"
              checked={config.notificaciones_sistema}
              onChange={(e) => setConfig({ ...config, notificaciones_sistema: e.target.checked })}
              className="w-5 h-5"
            />
          </div>
          <Input
            label="Umbral de Stock Mínimo para Alerta"
            type="number"
            value={config.stock_minimo_alerta}
            onChange={(e) => setConfig({ ...config, stock_minimo_alerta: e.target.value })}
            placeholder="5"
          />
        </div>
      </Card>

      {/* Respaldo de Datos */}
      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
          Respaldo y Seguridad
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Respaldo Automático de Datos</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Realizar respaldos diarios de la base de datos</p>
            </div>
            <input
              type="checkbox"
              checked={config.respaldar_datos}
              onChange={(e) => setConfig({ ...config, respaldar_datos: e.target.checked })}
              className="w-5 h-5"
            />
          </div>
          <Button variant="secondary" className="w-full">
            Realizar Respaldo Ahora
          </Button>
          <Button variant="secondary" className="w-full">
            Descargar Respaldo
          </Button>
        </div>
      </Card>

      {/* Información del Sistema */}
      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
          Información del Sistema
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">Versión:</span>
            <span className="font-medium text-slate-900 dark:text-white">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">Última actualización:</span>
            <span className="font-medium text-slate-900 dark:text-white">8 de Septiembre de 2026</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-600 dark:text-slate-400">Base de datos:</span>
            <span className="font-medium text-slate-900 dark:text-white">MongoDB</span>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button variant="secondary">Cancelar</Button>
        <Button variant="success" onClick={handleSave}>
          <Save size={20} /> Guardar Cambios
        </Button>
      </div>
    </div>
  );
};
