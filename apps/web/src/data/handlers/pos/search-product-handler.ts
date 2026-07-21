import type { IHttpClient } from '@/@contracts/http';
import type { Product } from '@/domain/models/pos';
import type { ISearchProduct } from '@/domain/usecases/pos/search-product';
import { posEndpoints } from '@/infra/endpoints/pos';

export class SearchProductHandler implements ISearchProduct {
  constructor(private readonly httpClient: IHttpClient) {}

  async search(query: string, perPage: number): Promise<{ items: Product[] }> {
    const response = await this.httpClient.request<undefined, { items: Product[] }>({
      url: posEndpoints.products(),
      method: 'GET',
      queryParams: { search: query, perPage },
    });
    return response.body;
  }
}
