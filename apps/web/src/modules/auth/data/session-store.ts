import type { IKeyValueStorage } from '@shared/storage';
import type { ISession, ISessionUser } from '../domain/session-model';

// Chaves mantidas como antes: sessões já salvas no navegador continuam valendo.
const TOKEN_KEY = 'sol.token';
const USER_KEY = 'sol.user';

/** Sessão guardada no navegador, observável (para `useSyncExternalStore`). */
export class SessionStore {
  private current: ISession | null;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly storage: IKeyValueStorage) {
    this.current = this.read();
  }

  get = (): ISession | null => this.current;

  getToken = (): string | null => this.current?.token ?? null;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  start(token: string, user: ISessionUser) {
    this.write({ token, user });
  }

  /** Troca o usuário guardado pelo que a API diz agora (nome, papel, permissões). */
  refreshUser(user: ISessionUser) {
    if (this.current) this.write({ token: this.current.token, user });
  }

  clear() {
    this.write(null);
  }

  private read(): ISession | null {
    const token = this.storage.get(TOKEN_KEY);
    const rawUser = this.storage.get(USER_KEY);
    if (!token || !rawUser) return null;
    try {
      return { token, user: JSON.parse(rawUser) as ISessionUser };
    } catch {
      return null;
    }
  }

  private write(next: ISession | null) {
    this.current = next;
    if (next) {
      this.storage.set(TOKEN_KEY, next.token);
      this.storage.set(USER_KEY, JSON.stringify(next.user));
    } else {
      this.storage.remove(TOKEN_KEY);
      this.storage.remove(USER_KEY);
    }
    this.listeners.forEach((listener) => listener());
  }
}
