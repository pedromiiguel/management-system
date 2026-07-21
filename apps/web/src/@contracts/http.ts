export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpRequest<B = undefined> = {
  url: string;
  method: HttpMethod;
  queryParams?: Record<string, unknown>;
  body?: B;
  headers?: Record<string, string>;
};

export type HttpResponse<T> = { statusCode: number; body: T };

export interface IHttpClient {
  request: <B, R>(data: HttpRequest<B>) => Promise<HttpResponse<R>>;
}
