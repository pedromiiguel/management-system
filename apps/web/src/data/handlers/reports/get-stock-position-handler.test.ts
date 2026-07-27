import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { GetStockPositionHandler } from './get-stock-position-handler';

describe('GetStockPositionHandler', () => {
  it('busca a posição de estoque via GET /reports/stock-position', async () => {
    const rows = [{ id: 'p1', sku: 'SKU', name: 'Produto', unit: 'un', currentStock: 1, minimumStock: 0, stockCost: 1, stockValue: 2 }];
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: rows }) };
    const handler = new GetStockPositionHandler(httpClient);

    const result = await handler.get();

    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/reports/stock-position',
      method: 'GET',
    });
    expect(result).toBe(rows);
  });
});
