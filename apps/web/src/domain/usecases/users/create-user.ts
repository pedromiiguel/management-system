import type { CreateUserInput, UserRow } from '@/domain/models/users';

export interface ICreateUser {
  create: (input: CreateUserInput) => Promise<UserRow>;
}
