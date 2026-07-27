import type { LoginInput, LoginResult } from '@/domain/models/auth';

export interface ILogin {
  login: (input: LoginInput) => Promise<LoginResult>;
}
