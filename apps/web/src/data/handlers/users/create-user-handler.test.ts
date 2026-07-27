import { describe, expect, it, vi } from 'vitest';
import type { IHttpClient } from '@/@contracts/http';
import { CreateUserHandler } from './create-user-handler';

describe('CreateUserHandler', () => {
  it('cria um usuário via POST /users', async () => {
    const user = { id: 'u1' };
    const httpClient: IHttpClient = { request: vi.fn().mockResolvedValue({ statusCode: 201, body: user }) };
    const handler = new CreateUserHandler(httpClient);
    const input = { name: 'Operador', login: 'operador', password: 'senha123', roleId: 'r1', active: true };

    const result = await handler.create(input);

    expect(httpClient.request).toHaveBeenCalledWith({ url: '/users', method: 'POST', body: input });
    expect(result).toBe(user);
  });
});
