import { BadRequestException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  ALL_PERMISSIONS,
  CreateUserInput,
  RoleInput,
  UpdateRoleInput,
  UpdateUserInput,
} from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { effectivePermissions, SessionService } from '../auth/session.service';

const userSelect = {
  id: true,
  name: true,
  login: true,
  active: true,
  roleId: true,
  role: { select: { id: true, name: true } },
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
  ) {}

  listUsers() {
    return this.prisma.user.findMany({ select: userSelect, orderBy: { name: 'asc' } });
  }

  async createUser(input: CreateUserInput) {
    const { password, ...data } = input;
    return this.prisma.user.create({
      data: { ...data, passwordHash: await argon2.hash(password) },
      select: userSelect,
    });
  }

  async updateUser(id: string, input: UpdateUserInput) {
    const { password, ...data } = input;
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(password ? { passwordHash: await argon2.hash(password) } : {}),
      },
      select: userSelect,
    });
    this.sessions.invalidate();
    return user;
  }

  async listRoles() {
    const roles = await this.prisma.role.findMany({ orderBy: { name: 'asc' } });
    return roles.map((role) => ({ ...role, permissions: effectivePermissions(role) }));
  }

  createRole(input: RoleInput) {
    return this.prisma.role.create({ data: input });
  }

  /**
   * O papel de sistema (Administrador) tem sempre todas as permissões — evita
   * lockout. Pode ser renomeado, mas não ter permissões retiradas.
   */
  async updateRole(id: string, input: UpdateRoleInput) {
    const role = await this.prisma.role.findUniqueOrThrow({ where: { id } });
    if (role.system && input.permissions && !grantsEverything(input.permissions)) {
      throw new BadRequestException('O papel Administrador sempre tem todas as permissões');
    }
    const updated = await this.prisma.role.update({
      where: { id },
      data: { name: input.name, ...(role.system ? {} : { permissions: input.permissions }) },
    });
    this.sessions.invalidate();
    return { ...updated, permissions: effectivePermissions(updated) };
  }
}

function grantsEverything(permissions: string[]) {
  return ALL_PERMISSIONS.every((p) => permissions.includes(p));
}
