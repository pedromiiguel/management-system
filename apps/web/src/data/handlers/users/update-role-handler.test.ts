import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { UpdateRoleHandler } from './update-role-handler';

describe('UpdateRoleHandler', () => {
  it('edita um papel via PATCH /users/roles/:id', async () => {
    const role = { id: 'r1', name: 'Caixa' };
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: role }) };
    const handler = new UpdateRoleHandler(httpClient);
    const input = { name: 'Caixa', permissions: ['sales.operate', 'stock.read'] };

    const result = await handler.update('r1', input);

    expect(httpClient.request).toHaveBeenCalledWith({ url: '/users/roles/r1', method: 'PATCH', body: input });
    expect(result).toBe(role);
  });
});
