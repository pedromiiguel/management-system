import type { AxiosInstance } from 'axios';
import type { HttpRequest, HttpResponse, IHttpClient } from '@/@contracts/http';

export class AxiosHttpClient implements IHttpClient {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async request<B, R>(data: HttpRequest<B>): Promise<HttpResponse<R>> {
    const response = await this.axiosInstance.request<R>({
      url: data.url,
      method: data.method,
      params: data.queryParams,
      data: data.body,
      headers: data.headers,
    });
    return { statusCode: response.status, body: response.data };
  }
}
