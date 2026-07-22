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
    });
    expect(result).toEqual({ statusCode: 200, body: { items: [] } });
  });

  it('deixa o axios lançar em caso de erro (sem envelope Result<T> — ver ADR 0003)', async () => {
    const error = new Error('network down');
    const request = vi.fn().mockRejectedValue(error);
    const axiosInstance = { request } as unknown as AxiosInstance;
    const client = new AxiosHttpClient(axiosInstance);

    await expect(client.request({ url: '/sales', method: 'POST' })).rejects.toBe(error);
  });
});
