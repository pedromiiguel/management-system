import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { GetProductPerformanceHandler } from './get-product-performance-handler';

describe('GetProductPerformanceHandler', () => {
  it('busca o desempenho por produto via GET /reports/products', async () => {
    const rows = [{ product: null, quantity: 1, revenue: 1, cost: 1, margin: 0, marginPercent: 0 }];
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: rows }) };
    const handler = new GetProductPerformanceHandler(httpClient);

    const result = await handler.get('2026-07-01', '2026-07-24');

    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/reports/products',
      method: 'GET',
      queryParams: { from: '2026-07-01', to: '2026-07-24' },
    });
    expect(result).toBe(rows);
  });
});
