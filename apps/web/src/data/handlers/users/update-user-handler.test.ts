import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { UpdateUserHandler } from './update-user-handler';

describe('UpdateUserHandler', () => {
  it('edita um usuário via PATCH /users/:id', async () => {
    const user = { id: 'u1', active: false };
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 200, body: user }) };
    const handler = new UpdateUserHandler(httpClient);
    const input = { active: false };

    const result = await handler.update('u1', input);

    expect(httpClient.request).toHaveBeenCalledWith({ url: '/users/u1', method: 'PATCH', body: input });
    expect(result).toBe(user);
  });
});
