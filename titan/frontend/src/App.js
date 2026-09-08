import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Productos from './components/Productos';
import Ventas from './components/Ventas';
import Arqueo from './components/Arqueo';
import Reportes from './components/Reportes';
import { ShoppingCart, Package, CreditCard, BarChart3, Settings } from 'lucide-react';

function App() {
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const [datos, setDatos] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      const [productos, dashboard] = await Promise.all([
        fetch(`${API_URL}/productos`).then(r => r.json()),
        fetch(`${API_URL}/dashboard`).then(r => r.json())
      ]);
      setDatos({ productos, dashboard });
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  const componentes = {
    dashboard: <Dashboard datos={datos} apiUrl={API_URL} />,
    productos: <Productos apiUrl={API_URL} />,
    ventas: <Ventas apiUrl={API_URL} />,
    arqueo: <Arqueo apiUrl={API_URL} />,
    reportes: <Reportes apiUrl={API_URL} />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-green-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center font-bold text-2xl text-blue-900">
              💪
            </div>
            <div>
              <h1 className="text-3xl font-bold">EL TITÁN</h1>
              <p className="text-green-200 text-sm">Productos de Limpieza</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm">Sistema de Control</p>
            <p className="text-xs text-green-200">{new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 min-h-[calc(100vh-80px)]">
          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'ventas', icon: ShoppingCart, label: 'Registrar Venta' },
              { id: 'productos', icon: Package, label: 'Productos' },
              { id: 'arqueo', icon: CreditCard, label: 'Arqueo Caja' },
              { id: 'reportes', icon: BarChart3, label: 'Reportes' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setSeccionActiva(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  seccionActiva === id
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl">
            {componentes[seccionActiva]}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
