import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Caja } from './pages/Caja';
import { Ventas } from './pages/Ventas';
import { Stock } from './pages/Stock';
import { Productos } from './pages/Productos';
import { Categorias } from './pages/Categorias';
import { Clientes } from './pages/Clientes';
import { Reportes } from './pages/Reportes';
import { Usuarios } from './pages/Usuarios';
import { Configuracion } from './pages/Configuracion';
import { Sidebar, BottomNav } from './components/Navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type PageId = 'dashboard' | 'caja' | 'ventas' | 'stock' | 'productos' | 'categorias' | 'clientes' | 'reportes' | 'usuarios' | 'configuracion';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'caja':
        return <Caja />;
      case 'ventas':
        return <Ventas />;
      case 'stock':
        return <Stock />;
      case 'productos':
        return <Productos />;
      case 'categorias':
        return <Categorias />;
      case 'clientes':
        return <Clientes />;
      case 'reportes':
        return <Reportes />;
      case 'usuarios':
        return <Usuarios />;
      case 'configuracion':
        return <Configuracion />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg fixed top-0 left-0 right-0 z-40 h-16">
          <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-3 md:pl-56">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-xl text-blue-600">
                💪
              </div>
              <div>
                <h1 className="text-xl font-bold hidden md:block">EL TITÁN</h1>
                <p className="text-xs text-green-100">Sistema de Control</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs text-green-100">
                  {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
                </p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        <div className="flex pt-16">
          {/* Sidebar */}
          <Sidebar
            active={currentPage}
            onNavigate={(id) => setCurrentPage(id as PageId)}
            onLogout={() => alert('Sesión cerrada')}
          />

          {/* Main Content */}
          <main className="flex-1 md:ml-56">
            <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-6">
              {renderPage()}
            </div>
          </main>
        </div>

        {/* Bottom Navigation - Mobile */}
        <BottomNav
          active={currentPage}
          onNavigate={(id) => setCurrentPage(id as PageId)}
        />
      </div>
    </div>
  );
};

export default App;
