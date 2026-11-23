import { useSyncExternalStore } from 'react';
import type { Permission } from '@beverage/shared';
import { BrowserLocalStorage } from '@infra/storage/browser-local-storage';
import { queryClient } from '@main/query/query-client';
import { LOGIN_PATH } from '@presentation/constants/navigation';
import { SessionStore } from '../data/session-store';
import { hasPermission, type ISession, type ISessionUser } from '../domain/session-model';

const sessionStore = new SessionStore(new BrowserLocalStorage());

export const getSession = sessionStore.get;
export const getToken = sessionStore.getToken;

export function useSession(): ISession | null {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get);
}

export function usePermission(permission: Permission): boolean {
  return hasPermission(useSession(), permission);
}

export function startSession(token: string, user: ISessionUser) {
  sessionStore.start(token, user);
}

export function refreshSessionUser(user: ISessionUser) {
  sessionStore.refreshUser(user);
}

/** Único caminho de saída: botão "sair" e qualquer 401 da API. Também limpa o cache. */
export function logout() {
  sessionStore.clear();
  queryClient.clear();
  if (window.location.pathname !== LOGIN_PATH) window.location.assign(LOGIN_PATH);
}
