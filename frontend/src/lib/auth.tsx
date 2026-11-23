'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, SESSION_KEY, UNAUTHORIZED_EVENT } from './api';
import type { Perfil, Usuario } from './types';

interface Session { token: string; usuario: Usuario }
interface AuthState {
  usuario: Usuario | null;
  ready: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const homeDoPerfil = (perfil: Perfil) => (perfil === 'COORDENADOR' ? '/painel' : '/meu-historico');

function tokenExpirado(token: string): boolean {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof exp === 'number' && exp * 1000 < Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Session;
        if (tokenExpirado(s.token)) localStorage.removeItem(SESSION_KEY);
        else setSession(s);
      }
    } catch {}
    setReady(true);
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const login = useCallback(async (email: string, senha: string) => {
    const { accessToken, usuario } = await api.login(email, senha);
    const s = { token: accessToken, usuario };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    return usuario;
  }, []);

  const value = useMemo(
    () => ({ usuario: session?.usuario ?? null, ready, login, logout }),
    [session, ready, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
