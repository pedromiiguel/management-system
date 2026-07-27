import type { IHttpClient } from '@/@contracts/http';
import type { IExportProductPerformanceCsv } from '@/domain/usecases/reports/export-product-performance-csv';
import { reportsEndpoints } from '@/infra/endpoints/reports';

export class ExportProductPerformanceCsvHandler implements IExportProductPerformanceCsv {
  constructor(private readonly httpClient: IHttpClient) {}

  async export(from: string, to: string): Promise<Blob> {
    const response = await this.httpClient.request<undefined, Blob>({
      url: reportsEndpoints.products(),
      method: 'GET',
      queryParams: { from, to, format: 'csv' },
      responseType: 'blob',
    });
    return response.body;
  }
}
