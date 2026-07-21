import type { IHttpClient } from '@/@contracts/http';
import type { Customer } from '@/domain/models/pos';
import type { ISearchCustomer } from '@/domain/usecases/pos/search-customer';
import { posEndpoints } from '@/infra/endpoints/pos';

export class SearchCustomerHandler implements ISearchCustomer {
  constructor(private readonly httpClient: IHttpClient) {}

  async search(query: string): Promise<Customer[]> {
    const response = await this.httpClient.request<undefined, Customer[]>({
      url: posEndpoints.customers(),
      method: 'GET',
      queryParams: { search: query },
    });
    return response.body;
  }
}
