import type { IHttpClient } from '@/@contracts/http';
import type { AddSaleItemInput, Sale } from '@/domain/models/pos';
import type { IAddSaleItem } from '@/domain/usecases/pos/add-sale-item';
import { posEndpoints } from '@/infra/endpoints/pos';

export class AddSaleItemHandler implements IAddSaleItem {
  constructor(private readonly httpClient: IHttpClient) {}

  async add(saleId: string, input: AddSaleItemInput): Promise<{ sale: Sale; warning: string | null }> {
    const response = await this.httpClient.request<AddSaleItemInput, { sale: Sale; warning: string | null }>({
      url: posEndpoints.saleItems(saleId),
      method: 'POST',
      body: input,
    });
    return response.body;
  }
}
