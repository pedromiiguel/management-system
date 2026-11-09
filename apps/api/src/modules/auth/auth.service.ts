import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { LoginInput } from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { toAuthUser } from './session.service';

/** O token carrega só a identidade; permissões são resolvidas por requisição. */
export interface TokenPayload {
  sub: string;
}

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
    const payload: TokenPayload = { sub: user.id };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: toAuthUser(user),
    };
  }
}
