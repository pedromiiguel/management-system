import type { IHttpClient } from '@shared/http';
import { AxiosHttpClient } from '@infra/http/axios-http-client';
import { getToken, logout } from '@/lib/session';

// `||` e não `??`: VITE_API_URL definido e vazio (dev local) cai no proxy '/api' do Vite.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const httpClient = new AxiosHttpClient({
  baseURL: API_BASE_URL,
  getToken,
  onUnauthorized: logout,
});

/** Um único cliente HTTP para o app todo. */
export const makeHttpClient = (): IHttpClient => httpClient;
