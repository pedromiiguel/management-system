import type { IHttpClient } from '@/@contracts/http';
import type { StockPositionRow } from '@/domain/models/reports';
import type { IGetStockPosition } from '@/domain/usecases/reports/get-stock-position';
import { reportsEndpoints } from '@/infra/endpoints/reports';

export class GetStockPositionHandler implements IGetStockPosition {
  constructor(private readonly httpClient: IHttpClient) {}

  async get(): Promise<StockPositionRow[]> {
    const response = await this.httpClient.request<undefined, StockPositionRow[]>({
      url: reportsEndpoints.stockPosition(),
      method: 'GET',
    });
    return response.body;
  }
}
