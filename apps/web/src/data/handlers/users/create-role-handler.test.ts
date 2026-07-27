import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { CreateRoleHandler } from './create-role-handler';

describe('CreateRoleHandler', () => {
  it('cria um papel via POST /users/roles', async () => {
    const role = { id: 'r1' };
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 201, body: role }) };
    const handler = new CreateRoleHandler(httpClient);
    const input = { name: 'Caixa', permissions: ['sales.operate'] };

    const result = await handler.create(input);

    expect(httpClient.request).toHaveBeenCalledWith({ url: '/users/roles', method: 'POST', body: input });
    expect(result).toBe(role);
  });
});
