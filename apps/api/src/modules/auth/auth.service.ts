import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { LoginInput } from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ login, password }: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { login },
      include: { role: true },
    });
    if (!user || !user.active || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Login ou senha inválidos');
    }

    const payload = {
      id: user.id,
      name: user.name,
      login: user.login,
      roleId: user.roleId,
      permissions: user.role.permissions,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: { ...payload, roleName: user.role.name },
    };
  }
}
