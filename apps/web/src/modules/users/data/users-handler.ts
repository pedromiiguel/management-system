import { HttpMethod } from '@shared/http';
import { BaseService } from '@data/base-service/base-service';
import type { IUsersGateway } from '../domain/users-gateway';
import type {
  IRole,
  IUser,
  TCreateRoleParams,
  TCreateUserParams,
  TUpdateRoleParams,
} from '../domain/user-model';

const USERS_URL = '/users';
const ROLES_URL = '/users/roles';

export class UsersHandler extends BaseService implements IUsersGateway {
  listUsers() {
    return this.send<IUser[]>({ url: USERS_URL, method: HttpMethod.GET });
  }

  listRoles() {
    return this.send<IRole[]>({ url: `${ROLES_URL}/all`, method: HttpMethod.GET });
  }

  createUser(params: TCreateUserParams) {
    return this.send<IUser>({ url: USERS_URL, method: HttpMethod.POST, body: params });
  }

  createRole(params: TCreateRoleParams) {
    return this.send<IRole>({ url: ROLES_URL, method: HttpMethod.POST, body: params });
  }

  updateRole({ id, input }: TUpdateRoleParams) {
    return this.send<IRole>({ url: `${ROLES_URL}/${id}`, method: HttpMethod.PATCH, body: input });
  }
}
