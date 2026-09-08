import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (!email || !password) {
        setError('Por favor completa todos los campos');
        setLoading(false);
        return;
      }

      if (login(email, password)) {
        setEmail('');
        setPassword('');
      } else {
        setError('Email o contraseña incorrectos');
      }
      setLoading(false);
    }, 500);
  };

  const handleDemoAdmin = () => {
    setEmail('admin@eltitan.com');
    setPassword('admin123');
    setTimeout(() => login('admin@eltitan.com', 'admin123'), 100);
  };

  const handleDemoVendor = () => {
    setEmail('vendedor@eltitan.com');
    setPassword('vendedor123');
    setTimeout(() => login('vendedor@eltitan.com', 'vendedor123'), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Branding */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <span className="text-5xl">💪</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">EL TITÁN</h1>
          <p className="text-blue-100 text-lg">Productos de Limpieza</p>
          <p className="text-blue-200 text-sm mt-1">Sistema de Control y Ventas</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Acceso a Sistema</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-900 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-900 placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {loading ? 'Validando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-500">Demo</span>
            </div>
          </div>

          {/* Demo Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleDemoAdmin}
              type="button"
              className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold py-3 rounded-xl transition-all border border-amber-200"
            >
              👑 Acceso Admin
            </button>
            <button
              onClick={handleDemoVendor}
              type="button"
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold py-3 rounded-xl transition-all border border-emerald-200"
            >
              🛍️ Acceso Vendedor
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-500 mb-2">
              <strong>Demo Credenciales:</strong>
            </p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1">
              <p>👑 Admin: admin@eltitan.com / admin123</p>
              <p>🛍️ Vendedor: vendedor@eltitan.com / vendedor123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-blue-100 text-sm">
            © 2025 El Titán - Productos de Limpieza
          </p>
          <p className="text-blue-200/70 text-xs mt-1">
            Limpierza que hace la diferencia
          </p>
        </div>
      </div>
    </div>
  );
};
