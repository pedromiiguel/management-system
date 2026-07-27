import type { IHttpClient } from '@/@contracts/http';
import type { IExportStockPositionCsv } from '@/domain/usecases/reports/export-stock-position-csv';
import { reportsEndpoints } from '@/infra/endpoints/reports';

export class ExportStockPositionCsvHandler implements IExportStockPositionCsv {
  constructor(private readonly httpClient: IHttpClient) {}

  async export(): Promise<Blob> {
    const response = await this.httpClient.request<undefined, Blob>({
      url: reportsEndpoints.stockPosition(),
      method: 'GET',
      queryParams: { format: 'csv' },
      responseType: 'blob',
    });
    return response.body;
  }
}
