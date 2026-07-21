import type { IHttpClient } from '@/@contracts/http';
import type { DiscountInput, Sale } from '@/domain/models/pos';
import type { ISetSaleDiscount } from '@/domain/usecases/pos/set-sale-discount';
import { posEndpoints } from '@/infra/endpoints/pos';

export class SetSaleDiscountHandler implements ISetSaleDiscount {
  constructor(private readonly httpClient: IHttpClient) {}

  async set(saleId: string, discount: DiscountInput | null): Promise<Sale> {
    const response = await this.httpClient.request<DiscountInput | null, Sale>({
      url: posEndpoints.saleDiscount(saleId),
      method: 'PUT',
      body: discount,
    });
    return response.body;
  }
}
