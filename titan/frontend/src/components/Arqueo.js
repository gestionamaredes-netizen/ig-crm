import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

function Arqueo({ apiUrl }) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [montoReal, setMontoReal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [arqueos, setArqueos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarArqueos();
  }, []);

  const cargarArqueos = async () => {
    try {
      const response = await fetch(`${apiUrl}/arqueos`);
      const datos = await response.json();
      setArqueos(datos);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!montoReal) {
      setMensaje('Ingresa el monto contado');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/arqueo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha,
          monto_real: parseFloat(montoReal),
          observaciones
        })
      });

      if (response.ok) {
        const datos = await response.json();
        setResultado(datos);
        setMensaje('✅ Arqueo registrado');
        setMontoReal('');
        setObservaciones('');
        cargarArqueos();
        setTimeout(() => setMensaje(''), 3000);
      }
    } catch (err) {
      setMensaje(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <CreditCard size={28} />
        Arqueo de Caja
      </h2>

      {mensaje && (
        <div className={`p-4 rounded ${mensaje.includes('Error') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
          {mensaje}
        </div>
      )}

      {/* Formulario */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Registrar Arqueo</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Monto Contado (Real)</label>
              <input
                type="number"
                value={montoReal}
                onChange={(e) => setMontoReal(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas sobre el arqueo..."
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 h-24"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
          >
            Registrar Arqueo
          </button>
        </form>

        {resultado && (
          <div className={`mt-4 p-4 rounded ${resultado.diferencia === 0 ? 'bg-green-900/50' : 'bg-yellow-900/50'}`}>
            <div className="flex items-start gap-2">
              {resultado.diferencia === 0 ? (
                <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={24} />
              ) : (
                <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={24} />
              )}
              <div>
                <p className={resultado.diferencia === 0 ? 'text-green-400' : 'text-yellow-400'} style={{ fontWeight: 'bold' }}>
                  {resultado.estado}
                </p>
                <p className="text-slate-300 text-sm">
                  Esperado: ${resultado.monto_esperado.toFixed(2)} | Real: ${resultado.monto_real.toFixed(2)}
                </p>
                <p className={`text-sm font-bold ${resultado.diferencia === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  Diferencia: ${resultado.diferencia.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historial */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Historial de Arqueos</h3>

        {arqueos.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Sin arqueos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-300 border-b border-slate-600">
                <tr>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Esperado</th>
                  <th className="px-4 py-2">Real</th>
                  <th className="px-4 py-2">Diferencia</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {arqueos.map(arq => (
                  <tr key={arq.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-white">{new Date(arq.fecha).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3 text-white">${arq.monto_esperado.toFixed(2)}</td>
                    <td className="px-4 py-3 text-white">${arq.monto_real.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-bold ${arq.diferencia === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                      ${arq.diferencia.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${arq.diferencia === 0 ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                        {arq.diferencia === 0 ? 'OK' : 'DIFERENCIA'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{arq.observaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Arqueo;
