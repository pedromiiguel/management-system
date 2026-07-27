import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { SearchSaleHistoryHandler } from './search-sale-history-handler';

describe('SearchSaleHistoryHandler', () => {
  it('busca o histórico via GET /sales/history, incluindo o dia final até 23:59:59', async () => {
    const page = { items: [], total: 0, page: 1, perPage: 25 };
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: page }) };
    const handler = new SearchSaleHistoryHandler(httpClient);

    const result = await handler.search('2026-07-01', '2026-07-24');

    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/sales/history',
      method: 'GET',
      queryParams: { from: '2026-07-01', to: '2026-07-24T23:59:59' },
    });
    expect(result).toBe(page);
  });
});
