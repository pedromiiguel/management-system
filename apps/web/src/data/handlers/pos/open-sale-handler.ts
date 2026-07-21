import type { IHttpClient } from '@/@contracts/http';
import type { Sale } from '@/domain/models/pos';
import type { IOpenSale } from '@/domain/usecases/pos/open-sale';
import { posEndpoints } from '@/infra/endpoints/pos';

export class OpenSaleHandler implements IOpenSale {
  constructor(private readonly httpClient: IHttpClient) {}

  async open(): Promise<Sale> {
    const response = await this.httpClient.request<undefined, Sale>({
      url: posEndpoints.sales(),
      method: 'POST',
    });
    return response.body;
  }
}
