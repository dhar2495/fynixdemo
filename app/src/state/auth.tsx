import React, { createContext, useContext, useState } from 'react';
import { api, setToken } from '../api/client';

interface AuthUser { id: string; email: string; name: string; role: string; }
interface AuthState {
  user: AuthUser | null;
  currency: string;
  setCurrency: (c: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currency, setCurrency] = useState('INR');

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
  };
  const logout = () => { setToken(null); setUser(null); };

  return <Ctx.Provider value={{ user, currency, setCurrency, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
