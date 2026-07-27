import type { IHttpClient } from '@/@contracts/http';
import type { IGetSalesTotal } from '@/domain/usecases/reports/get-sales-total';
import { reportsEndpoints } from '@/infra/endpoints/reports';

export class GetSalesTotalHandler implements IGetSalesTotal {
  constructor(private readonly httpClient: IHttpClient) {}

  async get(from: string, to: string): Promise<{ total: number }> {
    const response = await this.httpClient.request<undefined, { total: number }>({
      url: reportsEndpoints.sales(),
      method: 'GET',
      queryParams: { from, to },
    });
    return response.body;
  }
}
