export interface SessionUser {
  id: string;
  name: string;
  login: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface LoginResult {
  accessToken: string;
  user: SessionUser;
}

export type { LoginInput } from '@beverage/shared';
