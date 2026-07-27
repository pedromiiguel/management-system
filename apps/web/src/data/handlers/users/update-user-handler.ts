import type { IHttpClient } from '@/@contracts/http';
import type { UpdateUserInput, UserRow } from '@/domain/models/users';
import type { IUpdateUser } from '@/domain/usecases/users/update-user';
import { usersEndpoints } from '@/infra/endpoints/users';

export class UpdateUserHandler implements IUpdateUser {
  constructor(private readonly httpClient: IHttpClient) {}

  async update(id: string, input: UpdateUserInput): Promise<UserRow> {
    const response = await this.httpClient.request<UpdateUserInput, UserRow>({
      url: usersEndpoints.user(id),
      method: 'PATCH',
      body: input,
    });
    return response.body;
  }
}
