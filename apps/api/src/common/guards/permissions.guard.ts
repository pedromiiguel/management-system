import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '@beverage/shared';
import { AuthUser } from '../decorators/current-user.decorator';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

/** Lança 403 se o usuário não tiver a permissão. */
export function assertPermission(user: AuthUser | undefined, permission: Permission) {
  if (!user?.permissions.includes(permission)) {
    throw new ForbiddenException('Você não tem permissão para esta ação');
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    assertPermission(user, required);
    return true;
  }
}
