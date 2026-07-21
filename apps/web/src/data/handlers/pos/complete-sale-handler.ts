import type { IHttpClient } from '@/@contracts/http';
import type { CompleteSaleInput, Sale } from '@/domain/models/pos';
import type { ICompleteSale } from '@/domain/usecases/pos/complete-sale';
import { posEndpoints } from '@/infra/endpoints/pos';

export class CompleteSaleHandler implements ICompleteSale {
  constructor(private readonly httpClient: IHttpClient) {}

  async complete(saleId: string, input: CompleteSaleInput): Promise<Sale> {
    const response = await this.httpClient.request<CompleteSaleInput, Sale>({
      url: posEndpoints.saleComplete(saleId),
      method: 'POST',
      body: input,
    });
    return response.body;
  }
}
