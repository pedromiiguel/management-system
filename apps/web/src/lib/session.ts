import { useSyncExternalStore } from 'react';
import type { Permission } from '@beverage/shared';
import { queryClient } from './query-client';

export interface SessionUser {
  id: string;
  name: string;
  login: string;
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export interface Session {
  token: string;
  user: SessionUser;
}

export const HOME_PATH = '/sale';

// Chaves mantidas como antes: sessões já salvas no navegador continuam valendo.
const TOKEN_KEY = 'sol.token';
const USER_KEY = 'sol.user';

function read(): Session | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;
  try {
    return { token, user: JSON.parse(rawUser) as SessionUser };
  } catch {
    return null;
  }
}

let current: Session | null = read();
const listeners = new Set<() => void>();

function set(next: Session | null) {
  current = next;
  if (next) {
    localStorage.setItem(TOKEN_KEY, next.token);
    localStorage.setItem(USER_KEY, JSON.stringify(next.user));
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSession(): Session | null {
  return current;
}

export function getToken(): string | null {
  return current?.token ?? null;
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession);
}

export function hasPermission(session: Session | null, permission: Permission): boolean {
  return session?.user.permissions.includes(permission) ?? false;
}

export function startSession(token: string, user: SessionUser) {
  set({ token, user });
}

/** Troca o usuário guardado pelo que a API diz agora (nome, papel, permissões). */
export function refreshSessionUser(user: SessionUser) {
  if (current) set({ token: current.token, user });
}

/** Único caminho de saída: botão "sair" e qualquer 401 da API. */
export function logout() {
  set(null);
  queryClient.clear();
  if (window.location.pathname !== '/login') window.location.assign('/login');
}

/** Destino pós-login: só caminho interno (um único "/"), evitando open redirect. */
export function safeRedirectTarget(target: string | undefined): string {
  if (target && target.startsWith('/') && !target.startsWith('//')) return target;
  return HOME_PATH;
}
