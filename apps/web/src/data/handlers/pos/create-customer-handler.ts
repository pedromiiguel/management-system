import type { IHttpClient } from '@/@contracts/http';
import type { Customer } from '@/domain/models/pos';
import type { ICreateCustomer } from '@/domain/usecases/pos/create-customer';
import { posEndpoints } from '@/infra/endpoints/pos';

export class CreateCustomerHandler implements ICreateCustomer {
  constructor(private readonly httpClient: IHttpClient) {}

  async create(name: string): Promise<Customer> {
    const response = await this.httpClient.request<{ name: string }, Customer>({
      url: posEndpoints.customers(),
      method: 'POST',
      body: { name },
    });
    return response.body;
  }
}
