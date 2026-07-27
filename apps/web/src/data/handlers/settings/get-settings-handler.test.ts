import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { GetSettingsHandler } from './get-settings-handler';

describe('GetSettingsHandler', () => {
  it('busca as configurações via GET /settings', async () => {
    const settings = { stockPolicy: 'BLOCK' };
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: settings }) };
    const handler = new GetSettingsHandler(httpClient);

    const result = await handler.get();

    expect(httpClient.request).toHaveBeenCalledWith({ url: '/settings', method: 'GET' });
    expect(result).toBe(settings);
  });
});
