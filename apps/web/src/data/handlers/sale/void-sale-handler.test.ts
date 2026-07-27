import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { VoidSaleHandler } from './void-sale-handler';

describe('VoidSaleHandler', () => {
  it('estorna a venda concluída via POST /sales/:id/void', async () => {
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: {} }) };
    const handler = new VoidSaleHandler(httpClient);

    await handler.void('s1');

    expect(httpClient.request).toHaveBeenCalledWith({ url: '/sales/s1/void', method: 'POST' });
  });
});
