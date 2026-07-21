import type { IHttpClient } from '@/@contracts/http';
import type { Sale } from '@/domain/models/pos';
import type { IDeleteSaleItem } from '@/domain/usecases/pos/delete-sale-item';
import { posEndpoints } from '@/infra/endpoints/pos';

export class DeleteSaleItemHandler implements IDeleteSaleItem {
  constructor(private readonly httpClient: IHttpClient) {}

  async delete(saleId: string, itemId: string): Promise<Sale> {
    const response = await this.httpClient.request<undefined, Sale>({
      url: posEndpoints.saleItem(saleId, itemId),
      method: 'DELETE',
    });
    return response.body;
  }
}
