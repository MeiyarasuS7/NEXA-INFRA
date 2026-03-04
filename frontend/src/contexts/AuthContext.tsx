import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  loginAs: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<UserRole, User> = {
  SUPER_ADMIN: { id: '1', name: 'Admin User', email: 'admin@nexa-infra.com', role: 'SUPER_ADMIN', createdAt: '2024-01-01' },
  CONTRACTOR: { id: '2', name: 'James Wilson', email: 'james@contractor.com', role: 'CONTRACTOR', createdAt: '2024-02-15' },
  USER: { id: '3', name: 'Sarah Chen', email: 'sarah@email.com', role: 'USER', createdAt: '2024-03-10' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    role: null,
    isLoading: false,
  });

  const login = useCallback(async (email: string, _password: string) => {
    setState(s => ({ ...s, isLoading: true }));
    await new Promise(r => setTimeout(r, 800));
    const role: UserRole = email.includes('admin') ? 'SUPER_ADMIN' : email.includes('contractor') ? 'CONTRACTOR' : 'USER';
    setState({ user: MOCK_USERS[role], token: 'mock-jwt-token', role, isLoading: false });
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string, role: UserRole) => {
    setState(s => ({ ...s, isLoading: true }));
    await new Promise(r => setTimeout(r, 800));
    const user: User = { id: Date.now().toString(), name, email, role, createdAt: new Date().toISOString() };
    setState({ user, token: 'mock-jwt-token', role, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null, role: null, isLoading: false });
  }, []);

  const loginAs = useCallback((role: UserRole) => {
    setState({ user: MOCK_USERS[role], token: 'mock-jwt-token', role, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, loginAs }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
