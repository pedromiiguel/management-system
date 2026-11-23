import type { CreateUserInput, Permission, RoleInput, UpdateRoleInput } from '@beverage/shared';

export interface IRole {
  id: string;
  name: string;
  permissions: Permission[];
  /** Papel de sistema (Administrador): permissões fixas. */
  system: boolean;
}

export interface IUser {
  id: string;
  name: string;
  login: string;
  active: boolean;
  roleId: string;
  role: Pick<IRole, 'id' | 'name'>;
}

export type TCreateUserParams = CreateUserInput;
export type TCreateRoleParams = RoleInput;
export type TUpdateRoleParams = { id: string; input: UpdateRoleInput };
