import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { SearchUserHandler } from './search-user-handler';

describe('SearchUserHandler', () => {
  it('lista usuários via GET /users', async () => {
    const users = [{ id: 'u1' }];
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: users }) };
    const handler = new SearchUserHandler(httpClient);

    const result = await handler.search();

    expect(httpClient.request).toHaveBeenCalledWith({ url: '/users', method: 'GET' });
    expect(result).toBe(users);
  });
});
