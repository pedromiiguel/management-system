import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Permission } from '@beverage/shared';

/** Usuário da requisição, resolvido do banco a cada requisição (ver SessionService). */
export interface AuthUser {
  id: string;
  name: string;
  login: string;
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
  return request.user;
});
