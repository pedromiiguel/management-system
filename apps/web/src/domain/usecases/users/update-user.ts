import type { UpdateUserInput, UserRow } from '@/domain/models/users';

export interface IUpdateUser {
  update: (id: string, input: UpdateUserInput) => Promise<UserRow>;
}
