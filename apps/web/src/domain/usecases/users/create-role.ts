import type { Role, RoleInput } from '@/domain/models/users';

export interface ICreateRole {
  create: (input: RoleInput) => Promise<Role>;
}
