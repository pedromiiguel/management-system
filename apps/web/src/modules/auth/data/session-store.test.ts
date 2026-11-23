import { describe, expect, it } from 'vite-plus/test';
import type { IKeyValueStorage } from '@shared/storage';
import type { ISessionUser } from '../domain/session-model';
import { SessionStore } from './session-store';

const USER: ISessionUser = {
  id: 'u1',
  name: 'Ana',
  login: 'ana',
  roleId: 'r1',
  roleName: 'Caixa',
  permissions: [],
};

const makeStorage = (initial: Record<string, string> = {}): IKeyValueStorage => {
  const values = new Map(Object.entries(initial));
  return {
    get: (key) => values.get(key) ?? null,
    set: (key, value) => void values.set(key, value),
    remove: (key) => void values.delete(key),
  };
};

describe('SessionStore', () => {
  it('retoma a sessão salva por versões anteriores', () => {
    const store = new SessionStore(
      makeStorage({ 'sol.token': 't', 'sol.user': JSON.stringify(USER) }),
    );
    expect(store.get()).toEqual({ token: 't', user: USER });
  });

  it('ignora usuário salvo corrompido', () => {
    expect(new SessionStore(makeStorage({ 'sol.token': 't', 'sol.user': '{' })).get()).toBeNull();
  });

  it('persiste, avisa os observadores e limpa', () => {
    const storage = makeStorage();
    const store = new SessionStore(storage);
    let notified = 0;
    store.subscribe(() => notified++);

    store.start('t', USER);
    expect(new SessionStore(storage).getToken()).toBe('t');

    store.clear();
    expect(new SessionStore(storage).get()).toBeNull();
    expect(notified).toBe(2);
  });

  it('não recria sessão ao atualizar o usuário depois do logout', () => {
    const store = new SessionStore(makeStorage());
    store.refreshUser(USER);
    expect(store.get()).toBeNull();
  });
});
