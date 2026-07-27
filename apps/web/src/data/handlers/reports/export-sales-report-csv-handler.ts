import type { IHttpClient } from '@/@contracts/http';
import type { IExportSalesReportCsv } from '@/domain/usecases/reports/export-sales-report-csv';
import { reportsEndpoints } from '@/infra/endpoints/reports';

export class ExportSalesReportCsvHandler implements IExportSalesReportCsv {
  constructor(private readonly httpClient: IHttpClient) {}

  async export(from: string, to: string): Promise<Blob> {
    const response = await this.httpClient.request<undefined, Blob>({
      url: reportsEndpoints.sales(),
      method: 'GET',
      queryParams: { from, to, format: 'csv' },
      responseType: 'blob',
    });
    return response.body;
  }
}
