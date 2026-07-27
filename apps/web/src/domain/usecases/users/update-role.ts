import type { Role, RoleInput } from '@/domain/models/users';

export interface IUpdateRole {
  update: (id: string, input: RoleInput) => Promise<Role>;
}
