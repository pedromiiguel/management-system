import { Injectable } from '@nestjs/common';
import { ALL_PERMISSIONS, isPermission, Permission } from '@beverage/shared';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

const CACHE_TTL_MS = 30_000;

/**
 * Permissões efetivas de um papel. O papel de sistema (Administrador) tem
 * sempre o catálogo inteiro — permissão nova chega a ele sem reseed.
 */
export function effectivePermissions(role: {
  system: boolean;
  permissions: string[];
}): Permission[] {
  return role.system ? [...ALL_PERMISSIONS] : role.permissions.filter(isPermission);
}

/**
 * Resolve o usuário de cada requisição a partir do id do token, em vez de
 * confiar numa cópia das permissões congelada no JWT: mudar papel ou desativar
 * usuário vale na hora. Cache curto, limpo a cada alteração de usuário/papel.
 */
@Injectable()
export class SessionService {
  private readonly cache = new Map<string, { user: AuthUser | null; expiresAt: number }>();

  constructor(private readonly prisma: PrismaService) {}

  /** `null` = usuário inexistente ou desativado. */
  async resolve(userId: string): Promise<AuthUser | null> {
    const cached = this.cache.get(userId);
    if (cached && cached.expiresAt > Date.now()) return cached.user;

    const row = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    const user = row?.active ? toAuthUser(row) : null;
    this.cache.set(userId, { user, expiresAt: Date.now() + CACHE_TTL_MS });
    return user;
  }

  /** Chamado por quem altera usuários ou papéis. */
  invalidate() {
    this.cache.clear();
  }
}

export function toAuthUser(user: {
  id: string;
  name: string;
  login: string;
  roleId: string;
  role: { name: string; system: boolean; permissions: string[] };
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    login: user.login,
    roleId: user.roleId,
    roleName: user.role.name,
    permissions: effectivePermissions(user.role),
  };
}
