import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { SearchRoleHandler } from './search-role-handler';

describe('SearchRoleHandler', () => {
  it('lista papéis via GET /users/roles/all', async () => {
    const roles = [{ id: 'r1' }];
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: roles }) };
    const handler = new SearchRoleHandler(httpClient);

    const result = await handler.search();

    expect(httpClient.request).toHaveBeenCalledWith({ url: '/users/roles/all', method: 'GET' });
    expect(result).toBe(roles);
  });
});
