export interface Role {
  id: string;
  name: string;
  permissions: string[];
  system: boolean;
}

export interface UserRow {
  id: string;
  name: string;
  login: string;
  active: boolean;
  roleId: string;
  role: { id: string; name: string };
}

export type { CreateUserInput, UpdateUserInput, RoleInput } from '@beverage/shared';
