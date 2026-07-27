import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { UpdateSettingsHandler } from './update-settings-handler';

describe('UpdateSettingsHandler', () => {
  it('atualiza as configurações via PUT /settings', async () => {
    const settings = { stockPolicy: 'WARN' };
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: settings }) };
    const handler = new UpdateSettingsHandler(httpClient);
    const input = { stockPolicy: 'WARN' as const };

    const result = await handler.update(input);

    expect(httpClient.request).toHaveBeenCalledWith({ url: '/settings', method: 'PUT', body: input });
    expect(result).toBe(settings);
  });
});
