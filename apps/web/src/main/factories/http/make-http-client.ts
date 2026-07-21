import type { IHttpClient } from '@/@contracts/http';
import { AxiosHttpClient } from '@/infra/http/axios-http-client';
import { api } from '@/lib/api';

export const httpClient: IHttpClient = new AxiosHttpClient(api);
