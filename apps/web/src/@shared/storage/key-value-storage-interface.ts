/** Armazenamento chave-valor síncrono do navegador. */
export interface IKeyValueStorage {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
}
