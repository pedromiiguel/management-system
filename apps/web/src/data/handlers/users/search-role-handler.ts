import type { IHttpClient } from '@/@contracts/http';
import type { Role } from '@/domain/models/users';
import type { ISearchRole } from '@/domain/usecases/users/search-role';
import { usersEndpoints } from '@/infra/endpoints/users';

export class SearchRoleHandler implements ISearchRole {
  constructor(private readonly httpClient: IHttpClient) {}

  async search(): Promise<Role[]> {
    const response = await this.httpClient.request<undefined, Role[]>({
      url: usersEndpoints.rolesAll(),
      method: 'GET',
    });
    return response.body;
  }
}
