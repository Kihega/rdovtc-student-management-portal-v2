'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from './api';

export interface User {
  id: number;
  username: string;
  role: string;
  branch_name: string | null;
  phone: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('rdovtc_token');
    const storedUser  = localStorage.getItem('rdovtc_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await authApi.login(username, password);
    localStorage.setItem('rdovtc_token', data.token);
    localStorage.setItem('rdovtc_user',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    // Role-based redirect
    const role = data.user.role.toLowerCase();
    if (role === 'admin') {
      router.push('/dashboard/admin');
    } else if (role === 'executive director' || role === 'vet coordinator') {
      router.push('/dashboard/viewer');
    } else if (role === 'principal/tc') {
      router.push('/dashboard/principal');
    }
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (_) { /* ignore */ }
    localStorage.removeItem('rdovtc_token');
    localStorage.removeItem('rdovtc_user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
