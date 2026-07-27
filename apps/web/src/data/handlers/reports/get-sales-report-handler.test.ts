import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { GetSalesReportHandler } from './get-sales-report-handler';

describe('GetSalesReportHandler', () => {
  it('busca o relatório de vendas via GET /reports/sales', async () => {
    const report = { days: [], count: 0, total: 0, serviceFeeTotal: 0 };
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: report }) };
    const handler = new GetSalesReportHandler(httpClient);

    const result = await handler.get('2026-07-01', '2026-07-24');

    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/reports/sales',
      method: 'GET',
      queryParams: { from: '2026-07-01', to: '2026-07-24' },
    });
    expect(result).toBe(report);
  });
});
