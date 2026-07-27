import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Regra de negócio de `auth` com ramificação real alcançável a partir de
 * `login.tsx` (ADR 0011): `AuthService.login` rejeita usuário inexistente,
 * inativo ou com senha errada com a mesma mensagem genérica (mitigação de
 * enumeração de usuário). Senha errada/usuário inexistente já têm cobertura
 * E2E (`apps/e2e/tests/03-auth-guard.spec.ts`) — este gate cobre só usuário
 * inativo, a única ramificação ainda sem cobertura. Reset de schema único
 * para o arquivo, mesmo padrão de `products.e2e-spec.ts`.
 */
function resetDatabase(): void {
  const repoRoot = path.resolve(__dirname, '../../..');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  execFileSync(npmCmd, ['run', 'db:reset', '--workspace', 'apps/api'], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'Sim, pode resetar (Recomendado)',
    },
  });
}

describe('Auth — regras de negócio (ADR 0011)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    resetDatabase();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ login: 'admin', password: 'admin123' });
    adminToken = adminLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  function auth(token: string) {
    return `Bearer ${token}`;
  }

  let seq = 0;
  async function createRole() {
    seq += 1;
    const role = await request(app.getHttpServer())
      .post('/api/users/roles')
      .set('Authorization', auth(adminToken))
      .send({ name: `Papel auth ${seq} (teste)`, permissions: ['sales.operate'] })
      .expect(201);
    return role.body.id as string;
  }

  describe('Guarda: usuário inativo não pode logar mesmo com senha correta', () => {
    it('rejeita login de usuário inativo (401)', async () => {
      const roleId = await createRole();
      const created = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', auth(adminToken))
        .send({ name: 'Inativo Teste', login: 'inativo-teste', password: 'senha123', roleId, active: false })
        .expect(201);
      expect(created.body.active).toBe(false);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ login: 'inativo-teste', password: 'senha123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Login ou senha inválidos');
    });

    it('controle: usuário ativo com senha correta autentica normalmente', async () => {
      const roleId = await createRole();
      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', auth(adminToken))
        .send({ name: 'Ativo Teste', login: 'ativo-teste', password: 'senha123', roleId, active: true })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ login: 'ativo-teste', password: 'senha123' })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.login).toBe('ativo-teste');
    });
  });
});
