import type { IHttpClient } from '@/@contracts/http';
import type { Role, RoleInput } from '@/domain/models/users';
import type { ICreateRole } from '@/domain/usecases/users/create-role';
import { usersEndpoints } from '@/infra/endpoints/users';

export class CreateRoleHandler implements ICreateRole {
  constructor(private readonly httpClient: IHttpClient) {}

  async create(input: RoleInput): Promise<Role> {
    const response = await this.httpClient.request<RoleInput, Role>({
      url: usersEndpoints.roles(),
      method: 'POST',
      body: input,
    });
    return response.body;
  }
}
