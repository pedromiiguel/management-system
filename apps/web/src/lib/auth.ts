import type { Permission } from '@beverage/shared';
// SessionUser é definido em @/domain/models/auth (ADR 0011) — única fonte
// da verdade. Reexportado aqui porque este arquivo fica fora da Clean
// Architecture (ver Decisão 3 da ADR 0011: beforeLoad do TanStack Router
// roda fora da árvore React, sem acesso a hooks/factories de `main`).
import type { SessionUser } from '@/domain/models/auth';

export type { SessionUser };

const TOKEN_KEY = 'sol.token';
const USER_KEY = 'sol.user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): SessionUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as SessionUser) : null;
}

export function setSession(token: string, user: SessionUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function hasPermission(permission: Permission): boolean {
  return getUser()?.permissions.includes(permission) ?? false;
}
