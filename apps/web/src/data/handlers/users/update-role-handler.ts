import type { IHttpClient } from '@/@contracts/http';
import type { Role, RoleInput } from '@/domain/models/users';
import type { IUpdateRole } from '@/domain/usecases/users/update-role';
import { usersEndpoints } from '@/infra/endpoints/users';

export class UpdateRoleHandler implements IUpdateRole {
  constructor(private readonly httpClient: IHttpClient) {}

  async update(id: string, input: RoleInput): Promise<Role> {
    const response = await this.httpClient.request<RoleInput, Role>({
      url: usersEndpoints.role(id),
      method: 'PATCH',
      body: input,
    });
    return response.body;
  }
}
