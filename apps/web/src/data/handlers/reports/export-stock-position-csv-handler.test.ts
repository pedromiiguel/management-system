import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { ExportStockPositionCsvHandler } from './export-stock-position-csv-handler';

describe('ExportStockPositionCsvHandler', () => {
  it('busca o CSV via GET /reports/stock-position?format=csv, como blob', async () => {
    const blob = new Blob(['csv']);
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: blob }) };
    const handler = new ExportStockPositionCsvHandler(httpClient);

    const result = await handler.export();

    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/reports/stock-position',
      method: 'GET',
      queryParams: { format: 'csv' },
      responseType: 'blob',
    });
    expect(result).toBe(blob);
  });
});
