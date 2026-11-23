import type {
  IRole,
  IUser,
  TCreateRoleParams,
  TCreateUserParams,
  TUpdateRoleParams,
} from './user-model';

export interface IUsersGateway {
  listUsers: () => Promise<IUser[]>;
  listRoles: () => Promise<IRole[]>;
  createUser: (params: TCreateUserParams) => Promise<IUser>;
  createRole: (params: TCreateRoleParams) => Promise<IRole>;
  updateRole: (params: TUpdateRoleParams) => Promise<IRole>;
}
