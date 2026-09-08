import React, { useState } from 'react';
import { Plus, Check, AlertCircle } from 'lucide-react';
import { Card, StatCard } from '../components/Card';
import { Button } from '../components/Button';
import { Input, TextArea } from '../components/Input';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { mockVentas, mockArqueos } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/format';

export const Caja: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [montoReal, setMontoReal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [lastArqueo, setLastArqueo] = useState<any>(null);

  const totalVentas = mockVentas.reduce((sum, v) => sum + v.monto_total, 0);
  const efectivo = mockVentas
    .filter((v) => v.metodo_pago === 'EFECTIVO')
    .reduce((sum, v) => sum + v.monto_total, 0);
  const tarjeta = mockVentas
    .filter((v) => v.metodo_pago === 'TARJETA')
    .reduce((sum, v) => sum + v.monto_total, 0);
  const cheque = mockVentas
    .filter((v) => v.metodo_pago === 'CHEQUE')
    .reduce((sum, v) => sum + v.monto_total, 0);

  const handleArqueo = () => {
    const monto = parseFloat(montoReal);
    const diferencia = monto - totalVentas;
    setLastArqueo({
      fecha: new Date(),
      monto_esperado: totalVentas,
      monto_real: monto,
      diferencia,
      observaciones,
      estado: diferencia === 0 ? 'OK' : 'DIFERENCIA',
    });
    setShowModal(false);
    setMontoReal('');
    setObservaciones('');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Caja Diaria</h1>
        <Button variant="success" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Arqueo de Caja
        </Button>
      </div>

      {lastArqueo && (
        <Card
          className={`border-l-4 ${
            lastArqueo.estado === 'OK'
              ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
              : 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
          }`}
        >
          <div className="flex items-start gap-3">
            {lastArqueo.estado === 'OK' ? (
              <Check className="text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            )}
            <div>
              <h3
                className={`font-semibold ${
                  lastArqueo.estado === 'OK'
                    ? 'text-green-900 dark:text-green-200'
                    : 'text-yellow-900 dark:text-yellow-200'
                }`}
              >
                {lastArqueo.estado === 'OK' ? 'Caja Conforme' : 'Diferencia Detectada'}
              </h3>
              <p
                className={`text-sm ${
                  lastArqueo.estado === 'OK'
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-yellow-800 dark:text-yellow-300'
                }`}
              >
                Diferencia: {formatCurrency(lastArqueo.diferencia)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<span>💵</span>}
          label="Total Efectivo"
          value={formatCurrency(efectivo)}
          color="green"
        />
        <StatCard
          icon={<span>💳</span>}
          label="Total Tarjeta"
          value={formatCurrency(tarjeta)}
          color="blue"
        />
        <StatCard
          icon={<span>📋</span>}
          label="Total Cheque"
          value={formatCurrency(cheque)}
          color="yellow"
        />
        <StatCard
          icon={<span>📊</span>}
          label="Total Ventas"
          value={formatCurrency(totalVentas)}
          color="purple"
        />
      </div>

      {/* Detalles de Caja */}
      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
          Detalle por Método de Pago
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-700 dark:text-slate-300">Efectivo</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(efectivo)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-700 dark:text-slate-300">Tarjeta de Crédito/Débito</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(tarjeta)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-700 dark:text-slate-300">Cheque</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(cheque)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 font-bold">
            <span className="text-slate-900 dark:text-white">Total Esperado</span>
            <span className="text-lg text-slate-900 dark:text-white">{formatCurrency(totalVentas)}</span>
          </div>
        </div>
      </Card>

      {/* Histórico de Arqueos */}
      <Card>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
          Histórico de Arqueos
        </h3>
        <Table
          data={mockArqueos.map((a) => ({
            ...a,
            fecha: formatDate(a.fecha),
            diferencia: formatCurrency(a.diferencia),
            monto_esperado: formatCurrency(a.monto_esperado),
            monto_real: formatCurrency(a.monto_real),
            estado: a.diferencia === 0 ? 'Conforme' : 'Con Diferencia',
          }))}
          columns={[
            { key: 'fecha', label: 'Fecha' },
            { key: 'monto_esperado', label: 'Esperado' },
            { key: 'monto_real', label: 'Real' },
            { key: 'diferencia', label: 'Diferencia' },
            {
              key: 'estado',
              label: 'Estado',
              render: (value) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    value === 'Conforme'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}
                >
                  {value}
                </span>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal de Arqueo */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Realizar Arqueo de Caja"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={handleArqueo} disabled={!montoReal}>
              Confirmar Arqueo
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-300">Total Esperado</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalVentas)}
            </p>
          </div>
          <Input
            type="number"
            label="Monto Real en Caja"
            placeholder="0.00"
            value={montoReal}
            onChange={(e) => setMontoReal(e.target.value)}
            step="0.01"
          />
          <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-300">Diferencia</p>
            <p
              className={`text-2xl font-bold ${
                montoReal && parseFloat(montoReal) - totalVentas < 0
                  ? 'text-red-600'
                  : parseFloat(montoReal) - totalVentas > 0
                  ? 'text-green-600'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {montoReal ? formatCurrency(parseFloat(montoReal) - totalVentas) : formatCurrency(0)}
            </p>
          </div>
          <TextArea
            label="Observaciones (opcional)"
            placeholder="Notas sobre el arqueo..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
