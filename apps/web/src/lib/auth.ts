import type { Permission } from '@beverage/shared';

export interface SessionUser {
  id: string;
  name: string;
  login: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

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
