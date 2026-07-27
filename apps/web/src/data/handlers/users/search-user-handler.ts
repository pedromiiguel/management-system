import type { IHttpClient } from '@/@contracts/http';
import type { UserRow } from '@/domain/models/users';
import type { ISearchUser } from '@/domain/usecases/users/search-user';
import { usersEndpoints } from '@/infra/endpoints/users';

export class SearchUserHandler implements ISearchUser {
  constructor(private readonly httpClient: IHttpClient) {}

  async search(): Promise<UserRow[]> {
    const response = await this.httpClient.request<undefined, UserRow[]>({
      url: usersEndpoints.users(),
      method: 'GET',
    });
    return response.body;
  }
}
