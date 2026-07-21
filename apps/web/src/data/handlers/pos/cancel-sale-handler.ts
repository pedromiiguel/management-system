import type { IHttpClient } from '@/@contracts/http';
import type { ICancelSale } from '@/domain/usecases/pos/cancel-sale';
import { posEndpoints } from '@/infra/endpoints/pos';

export class CancelSaleHandler implements ICancelSale {
  constructor(private readonly httpClient: IHttpClient) {}

  async cancel(saleId: string): Promise<void> {
    await this.httpClient.request<undefined, unknown>({
      url: posEndpoints.saleCancel(saleId),
      method: 'POST',
    });
  }
}
