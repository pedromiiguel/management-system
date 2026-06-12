import { BadRequestException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateUserInput, RoleInput, UpdateUserInput } from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';

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
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(password ? { passwordHash: await argon2.hash(password) } : {}),
      },
      select: userSelect,
    });
  }

  listRoles() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }

  createRole(input: RoleInput) {
    return this.prisma.role.create({ data: input });
  }

  async updateRole(id: string, input: RoleInput) {
    const role = await this.prisma.role.findUniqueOrThrow({ where: { id } });
    if (role.system && input.permissions) {
      // O papel Administrador (system) mantém acesso total — evita lockout.
      throw new BadRequestException('O papel Administrador não pode ter permissões alteradas');
    }
    return this.prisma.role.update({ where: { id }, data: input });
  }
}
