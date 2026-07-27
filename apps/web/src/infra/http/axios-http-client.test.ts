import { describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { AxiosHttpClient } from './axios-http-client';

describe('AxiosHttpClient', () => {
  it('traduz method/url/queryParams/body pro formato do axios e devolve statusCode/body', async () => {
    const request = vi.fn().mockResolvedValue({ status: 200, data: { items: [] } });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const client = new AxiosHttpClient(axiosInstance);

    const result = await client.request<{ search: string }, { items: unknown[] }>({
      url: '/products',
      method: 'GET',
      queryParams: { search: 'skol' },
    });

    expect(request).toHaveBeenCalledWith({
      url: '/products',
      method: 'GET',
      params: { search: 'skol' },
      data: undefined,
      headers: undefined,
      responseType: 'json',
    });
    expect(result).toEqual({ statusCode: 200, body: { items: [] } });
  });

  it('repassa responseType: blob quando pedido (download de arquivo — ADR 0009)', async () => {
    const blob = new Blob(['csv']);
    const request = vi.fn().mockResolvedValue({ status: 200, data: blob });
    const axiosInstance = { request } as unknown as AxiosInstance;
    const client = new AxiosHttpClient(axiosInstance);

    await client.request({ url: '/reports/sales', method: 'GET', responseType: 'blob' });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/reports/sales', responseType: 'blob' }),
    );
  });

  it('deixa o axios lançar em caso de erro (sem envelope Result<T> — ver ADR 0003)', async () => {
    const error = new Error('network down');
    const request = vi.fn().mockRejectedValue(error);
    const axiosInstance = { request } as unknown as AxiosInstance;
    const client = new AxiosHttpClient(axiosInstance);

    await expect(client.request({ url: '/sales', method: 'POST' })).rejects.toBe(error);
  });
});
