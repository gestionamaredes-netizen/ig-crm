import React, { createContext, useState, useCallback } from 'react';

export type UserRole = 'admin' | 'vendor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string) => {
    // Credenciales de demostración
    const users: Record<string, { password: string; user: User }> = {
      'admin@eltitan.com': {
        password: 'admin123',
        user: {
          id: '1',
          name: 'Administrador General',
          email: 'admin@eltitan.com',
          role: 'admin',
        },
      },
      'vendedor@eltitan.com': {
        password: 'vendedor123',
        user: {
          id: '2',
          name: 'Vendedor',
          email: 'vendedor@eltitan.com',
          role: 'vendor',
        },
      },
    };

    const userData = users[email];
    if (userData && userData.password === password) {
      setUser(userData.user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
