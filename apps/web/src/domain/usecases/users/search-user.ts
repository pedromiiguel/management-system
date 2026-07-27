import type { UserRow } from '@/domain/models/users';

export interface ISearchUser {
  search: () => Promise<UserRow[]>;
}
