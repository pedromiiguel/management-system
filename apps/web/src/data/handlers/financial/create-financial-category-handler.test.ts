import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { CreateFinancialCategoryHandler } from './create-financial-category-handler';

describe('CreateFinancialCategoryHandler', () => {
  it('cria uma categoria financeira via POST /financial/categories', async () => {
    const category = { id: 'c1' };
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 201, body: category }) };
    const handler = new CreateFinancialCategoryHandler(httpClient);
    const input = { name: 'Manutenção', kind: 'EXPENSE' as const };

    const result = await handler.create(input);

    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/financial/categories',
      method: 'POST',
      body: input,
    });
    expect(result).toBe(category);
  });
});
