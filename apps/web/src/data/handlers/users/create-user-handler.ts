import type { IHttpClient } from '@/@contracts/http';
import type { CreateUserInput, UserRow } from '@/domain/models/users';
import type { ICreateUser } from '@/domain/usecases/users/create-user';
import { usersEndpoints } from '@/infra/endpoints/users';

export class CreateUserHandler implements ICreateUser {
  constructor(private readonly httpClient: IHttpClient) {}

  async create(input: CreateUserInput): Promise<UserRow> {
    const response = await this.httpClient.request<CreateUserInput, UserRow>({
      url: usersEndpoints.users(),
      method: 'POST',
      body: input,
    });
    return response.body;
  }
}
