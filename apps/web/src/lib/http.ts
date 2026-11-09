import axios, { type AxiosRequestConfig } from 'axios';
import { getToken, logout } from './session';

/** Erro de qualquer chamada à API, já com a mensagem pronta para o usuário. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ErrorBody = { message?: string | string[]; errors?: { message: string }[] };

export function errorMessage(body: unknown): string {
  const data = body as ErrorBody | undefined;
  if (data?.errors?.length) return data.errors.map((e) => e.message).join('; ');
  if (Array.isArray(data?.message)) return data.message.join('; ');
  if (data?.message) return data.message;
  return 'Erro inesperado — tente novamente';
}

// `||` e não `??`: VITE_API_URL definido e vazio (dev local) cai no proxy '/api' do Vite.
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(undefined, (error: unknown) => {
  if (!axios.isAxiosError(error)) return Promise.reject(error);
  const status = error.response?.status ?? 0;
  // Sessão expirada ou revogada. Sem sessão (ex.: senha errada no login), só vira erro.
  if (status === 401 && getToken()) logout();
  return Promise.reject(new ApiError(status, errorMessage(error.response?.data)));
});

type Params = Record<string, string | number | undefined>;

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await client.request<T>(config);
  return response.data;
}

export const http = {
  get: <T>(url: string, params?: Params) => request<T>({ method: 'GET', url, params }),
  post: <T>(url: string, body?: unknown) => request<T>({ method: 'POST', url, data: body }),
  put: <T>(url: string, body?: unknown) => request<T>({ method: 'PUT', url, data: body }),
  patch: <T>(url: string, body?: unknown) => request<T>({ method: 'PATCH', url, data: body }),
  delete: <T>(url: string) => request<T>({ method: 'DELETE', url }),
  /** Download de arquivo (ex.: exportação CSV). */
  blob: (url: string, params?: Params) =>
    request<Blob>({ method: 'GET', url, params, responseType: 'blob' }),
};

/** Envelope das listagens paginadas da API. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}
