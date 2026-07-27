import type { IHttpClient } from '@/@contracts/http';
import type { Paginated } from '@/domain/models/products';
import type { Sale } from '@/domain/models/sale';
import type { ISearchSaleHistory } from '@/domain/usecases/sale/search-sale-history';
import { saleEndpoints } from '@/infra/endpoints/sale';

export class SearchSaleHistoryHandler implements ISearchSaleHistory {
  constructor(private readonly httpClient: IHttpClient) {}

  async search(from: string, to: string): Promise<Paginated<Sale>> {
    const response = await this.httpClient.request<undefined, Paginated<Sale>>({
      url: saleEndpoints.salesHistory(),
      method: 'GET',
      queryParams: { from, to: `${to}T23:59:59` },
    });
    return response.body;
  }
}
