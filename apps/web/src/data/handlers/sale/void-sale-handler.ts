import type { IHttpClient } from '@/@contracts/http';
import type { IVoidSale } from '@/domain/usecases/sale/void-sale';
import { saleEndpoints } from '@/infra/endpoints/sale';

export class VoidSaleHandler implements IVoidSale {
  constructor(private readonly httpClient: IHttpClient) {}

  async void(saleId: string): Promise<void> {
    await this.httpClient.request<undefined, unknown>({
      url: saleEndpoints.saleVoid(saleId),
      method: 'POST',
    });
  }
}
