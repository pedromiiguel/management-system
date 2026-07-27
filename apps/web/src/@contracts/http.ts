export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpResponseType = 'json' | 'blob';

export type HttpRequest<B = undefined> = {
  url: string;
  method: HttpMethod;
  queryParams?: Record<string, unknown>;
  body?: B;
  headers?: Record<string, string>;
  /** `'blob'` para download de arquivo (ex. exportação CSV) — default `'json'`. */
  responseType?: HttpResponseType;
};

export type HttpResponse<T> = { statusCode: number; body: T };

export interface IHttpClient {
  request: <B, R>(data: HttpRequest<B>) => Promise<HttpResponse<R>>;
}
