/**
 * Ponte temporária para os módulos ainda em `features/`: mesmo transporte e
 * mesmos erros de domínio da Clean Architecture. Some quando a última
 * funcionalidade virar módulo (ver docs/arquitetura.md).
 */
import { HttpMethod } from '@shared/http';
import { BaseService } from '@data/base-service/base-service';
import { makeHttpClient } from '@main/factories/http/http-client-factory';

export type { IPaginated as Paginated } from '@domain/models/paginated-model';

type TParams = Record<string, string | number | undefined>;

class LegacyHttp extends BaseService {
  get = <T>(url: string, queryParams?: TParams) =>
    this.send<T>({ url, method: HttpMethod.GET, queryParams });
  post = <T>(url: string, body?: unknown) => this.send<T>({ url, method: HttpMethod.POST, body });
  put = <T>(url: string, body?: unknown) => this.send<T>({ url, method: HttpMethod.PUT, body });
  patch = <T>(url: string, body?: unknown) => this.send<T>({ url, method: HttpMethod.PATCH, body });
  delete = <T>(url: string) => this.send<T>({ url, method: HttpMethod.DELETE });
  /** Download de arquivo (ex.: exportação CSV). */
  blob = (url: string, queryParams?: TParams) =>
    this.send<Blob>({ url, method: HttpMethod.GET, queryParams, responseType: 'blob' });
}

export const http = new LegacyHttp(makeHttpClient());
