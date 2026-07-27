import type { IHttpClient } from '@/@contracts/http';
import type { FinancialCategory, FinancialCategoryInput } from '@/domain/models/financial';
import type { ICreateFinancialCategory } from '@/domain/usecases/financial/create-financial-category';
import { financialEndpoints } from '@/infra/endpoints/financial';

export class CreateFinancialCategoryHandler implements ICreateFinancialCategory {
  constructor(private readonly httpClient: IHttpClient) {}

  async create(input: FinancialCategoryInput): Promise<FinancialCategory> {
    const response = await this.httpClient.request<FinancialCategoryInput, FinancialCategory>({
      url: financialEndpoints.categories(),
      method: 'POST',
      body: input,
    });
    return response.body;
  }
}
