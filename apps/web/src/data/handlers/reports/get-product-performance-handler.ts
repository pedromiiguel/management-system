import type { IHttpClient } from '@/@contracts/http';
import type { ProductPerformance } from '@/domain/models/reports';
import type { IGetProductPerformance } from '@/domain/usecases/reports/get-product-performance';
import { reportsEndpoints } from '@/infra/endpoints/reports';

export class GetProductPerformanceHandler implements IGetProductPerformance {
  constructor(private readonly httpClient: IHttpClient) {}

  async get(from: string, to: string): Promise<ProductPerformance[]> {
    const response = await this.httpClient.request<undefined, ProductPerformance[]>({
      url: reportsEndpoints.products(),
      method: 'GET',
      queryParams: { from, to },
    });
    return response.body;
  }
}
