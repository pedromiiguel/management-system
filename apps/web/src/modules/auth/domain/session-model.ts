import type { LoginInput, Permission } from '@beverage/shared';

export interface ISessionUser {
  id: string;
  name: string;
  login: string;
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export interface ISession {
  token: string;
  user: ISessionUser;
}

export interface ILoginResponse {
  accessToken: string;
  user: ISessionUser;
}

export type TLoginParams = LoginInput;

export function hasPermission(session: ISession | null, permission: Permission): boolean {
  return session?.user.permissions.includes(permission) ?? false;
}
