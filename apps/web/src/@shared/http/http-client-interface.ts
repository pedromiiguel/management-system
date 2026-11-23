import type { HttpResponse } from './http-response';

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

export type HttpRequest<B = unknown> = {
  url: string;
  method: HttpMethod;
  queryParams?: Record<string, string | number | undefined>;
  body?: B;
  /** `blob` para download de arquivo (ex.: exportação CSV). */
  responseType?: 'json' | 'blob';
};

/** Transporte HTTP. Nunca lança: sem resposta (rede, timeout) devolve `statusCode` 0. */
export interface IHttpClient {
  request: <R = unknown, B = unknown>(data: HttpRequest<B>) => Promise<HttpResponse<R>>;
}
