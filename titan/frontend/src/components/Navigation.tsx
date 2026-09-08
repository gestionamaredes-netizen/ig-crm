import React from 'react';
import {
  BarChart3,
  ShoppingCart,
  Package,
  CreditCard,
  FileText,
  Users,
  Settings,
  Layers,
  UserCircle,
  LogOut,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: <BarChart3 size={20} /> },
  { id: 'caja', label: 'Caja Diaria', icon: <CreditCard size={20} /> },
  { id: 'ventas', label: 'Ventas', icon: <ShoppingCart size={20} /> },
  { id: 'stock', label: 'Stock', icon: <Package size={20} /> },
  { id: 'productos', label: 'Productos', icon: <Layers size={20} /> },
  { id: 'categorias', label: 'Categorías', icon: <Layers size={20} /> },
  { id: 'clientes', label: 'Clientes', icon: <Users size={20} /> },
  { id: 'reportes', label: 'Reportes', icon: <FileText size={20} /> },
  { id: 'usuarios', label: 'Usuarios', icon: <UserCircle size={20} /> },
  { id: 'configuracion', label: 'Configuración', icon: <Settings size={20} /> },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ active, onNavigate, onLogout }) => (
  <aside className="hidden md:flex flex-col w-56 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 min-h-screen fixed left-0 top-0">
    <div className="p-4 border-b border-slate-700">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center font-bold text-xl text-blue-900">
          💪
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">EL TITÁN</h1>
          <p className="text-xs text-green-300">Limpieza</p>
        </div>
      </div>
    </div>

    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
            active === item.id
              ? 'bg-green-500 text-white shadow-lg'
              : 'text-slate-300 hover:bg-slate-700/50'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>

    <div className="border-t border-slate-700 p-4">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-slate-300 hover:bg-slate-700/50 transition-all"
      >
        <LogOut size={20} />
        Salir
      </button>
    </div>
  </aside>
);

interface BottomNavProps {
  active: string;
  onNavigate: (id: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate }) => {
  const mainItems = NAV_ITEMS.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-2">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {mainItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              active === item.id
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
