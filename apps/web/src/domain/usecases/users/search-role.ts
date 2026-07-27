import type { Role } from '@/domain/models/users';

export interface ISearchRole {
  search: () => Promise<Role[]>;
}
