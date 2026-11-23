import type { IKeyValueStorage } from '@shared/storage';

export class BrowserLocalStorage implements IKeyValueStorage {
  get(key: string) {
    return localStorage.getItem(key);
  }

  set(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}
