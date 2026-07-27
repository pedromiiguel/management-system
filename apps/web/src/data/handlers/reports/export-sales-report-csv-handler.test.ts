import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { ExportSalesReportCsvHandler } from './export-sales-report-csv-handler';

describe('ExportSalesReportCsvHandler', () => {
  it('busca o CSV via GET /reports/sales?format=csv, como blob', async () => {
    const blob = new Blob(['csv']);
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: blob }) };
    const handler = new ExportSalesReportCsvHandler(httpClient);

    const result = await handler.export('2026-07-01', '2026-07-24');

    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/reports/sales',
      method: 'GET',
      queryParams: { from: '2026-07-01', to: '2026-07-24', format: 'csv' },
      responseType: 'blob',
    });
    expect(result).toBe(blob);
  });
});
