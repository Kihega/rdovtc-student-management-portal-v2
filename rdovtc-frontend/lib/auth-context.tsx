'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from './api';

interface User {
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
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem('jwt_token');
    const u = localStorage.getItem('jwt_user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res  = await authApi.login({ username, password });
    const { token: jwt, user: u } = res.data;
    localStorage.setItem('jwt_token', jwt);
    localStorage.setItem('jwt_user',  JSON.stringify(u));
    setToken(jwt);
    setUser(u);

    // Role-based redirect
    const role = u.role;
    if (role === 'Admin')              router.push('/dashboard/admin');
    else if (role === 'Principal/TC')  router.push('/dashboard/principal');
    else                               router.push('/dashboard/viewer');
  }, [router]);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_user');
    setToken(null);
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <Ctx.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}
