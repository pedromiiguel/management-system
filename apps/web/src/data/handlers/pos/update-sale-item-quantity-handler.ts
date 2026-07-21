import type { IHttpClient } from '@/@contracts/http';
import type { Sale, UpdateSaleItemInput } from '@/domain/models/pos';
import type { IUpdateSaleItemQuantity } from '@/domain/usecases/pos/update-sale-item-quantity';
import { posEndpoints } from '@/infra/endpoints/pos';

export class UpdateSaleItemQuantityHandler implements IUpdateSaleItemQuantity {
  constructor(private readonly httpClient: IHttpClient) {}

  async update(
    saleId: string,
    itemId: string,
    input: UpdateSaleItemInput,
  ): Promise<{ sale: Sale; warning: string | null }> {
    const response = await this.httpClient.request<UpdateSaleItemInput, { sale: Sale; warning: string | null }>({
      url: posEndpoints.saleItem(saleId, itemId),
      method: 'PATCH',
      body: input,
    });
    return response.body;
  }
}
