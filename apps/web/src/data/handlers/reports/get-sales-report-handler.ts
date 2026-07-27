import type { IHttpClient } from '@/@contracts/http';
import type { SalesReport } from '@/domain/models/reports';
import type { IGetSalesReport } from '@/domain/usecases/reports/get-sales-report';
import { reportsEndpoints } from '@/infra/endpoints/reports';

export class GetSalesReportHandler implements IGetSalesReport {
  constructor(private readonly httpClient: IHttpClient) {}

  async get(from: string, to: string): Promise<SalesReport> {
    const response = await this.httpClient.request<undefined, SalesReport>({
      url: reportsEndpoints.sales(),
      method: 'GET',
      queryParams: { from, to },
    });
    return response.body;
  }
}
