import axios, { type AxiosInstance } from 'axios';
import type { HttpRequest, HttpResponse, IHttpClient } from '@shared/http';

export interface IAxiosHttpClientDeps {
  baseURL: string;
  getToken: () => string | null;
  onUnauthorized: () => void;
}

/** `IHttpClient` sobre axios. Nunca lança: o handler decide o que é erro. */
export class AxiosHttpClient implements IHttpClient {
  private readonly instance: AxiosInstance;

  constructor(private readonly deps: IAxiosHttpClientDeps) {
    this.instance = axios.create({ baseURL: deps.baseURL });
  }

  async request<R, B>(data: HttpRequest<B>): Promise<HttpResponse<R>> {
    const token = this.deps.getToken();
    try {
      const response = await this.instance.request<R>({
        url: data.url,
        method: data.method,
        params: data.queryParams,
        data: data.body,
        responseType: data.responseType,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return { statusCode: response.status, body: response.data };
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;
      const statusCode = error.response?.status ?? 0;
      // Sessão expirada ou revogada. Sem sessão (ex.: senha errada no login), só vira erro.
      if (statusCode === 401 && token) this.deps.onUnauthorized();
      return { statusCode, body: error.response?.data as R };
    }
  }
}
