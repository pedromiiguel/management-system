import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { LoginHandler } from './login-handler';

describe('LoginHandler', () => {
  it('autentica via POST /auth/login', async () => {
    const result = { accessToken: 'jwt', user: { id: 'u1' } };
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 201, body: result }) };
    const handler = new LoginHandler(httpClient);
    const input = { login: 'admin', password: 'admin123' };

    const response = await handler.login(input);

    expect(httpClient.request).toHaveBeenCalledWith({ url: '/auth/login', method: 'POST', body: input });
    expect(response).toBe(result);
  });
});
