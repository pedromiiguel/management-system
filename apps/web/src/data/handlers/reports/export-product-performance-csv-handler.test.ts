import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { ExportProductPerformanceCsvHandler } from './export-product-performance-csv-handler';

describe('ExportProductPerformanceCsvHandler', () => {
  it('busca o CSV via GET /reports/products?format=csv, como blob', async () => {
    const blob = new Blob(['csv']);
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: blob }) };
    const handler = new ExportProductPerformanceCsvHandler(httpClient);

    const result = await handler.export('2026-07-01', '2026-07-24');

    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/reports/products',
      method: 'GET',
      queryParams: { from: '2026-07-01', to: '2026-07-24', format: 'csv' },
      responseType: 'blob',
    });
    expect(result).toBe(blob);
  });
});
