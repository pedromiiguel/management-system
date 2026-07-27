import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Permission } from '@beverage/shared';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Regra de negócio de `users` com ramificação real alcançável a partir de
 * `settings.tsx` (ADR 0010): a guarda de lockout em `updateRole` — o papel
 * `system` (Administrador) não pode ter suas permissões alteradas
 * (`users.service.ts`). Resto do módulo (create/update de usuário e papel,
 * settings) é CRUD simples sem branching, fora do gate por precedente das
 * ADRs 0007-0009. Reset de schema único para o arquivo, mesmo padrão de
 * `products.e2e-spec.ts`.
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

describe('Users — regras de negócio (ADR 0010)', () => {
  let app: INestApplication;
  let adminToken: string;
  /** Papel sem USERS_MANAGE — exercita a guarda de permissão do módulo. */
  let noManageToken: string;
  let adminRoleId: string;

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

    const roles = await request(app.getHttpServer())
      .get('/api/users/roles/all')
      .set('Authorization', auth(adminToken))
      .expect(200);
    adminRoleId = roles.body.find((r: { system: boolean }) => r.system).id;

    const role = await request(app.getHttpServer())
      .post('/api/users/roles')
      .set('Authorization', auth(adminToken))
      .send({ name: 'Operador sem gestão (teste)', permissions: [Permission.SALES_OPERATE] })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', auth(adminToken))
      .send({ name: 'Sem gestão', login: 'sem-gestao', password: 'senha123', roleId: role.body.id })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ login: 'sem-gestao', password: 'senha123' });
    noManageToken = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  function auth(token: string) {
    return `Bearer ${token}`;
  }

  describe('Guarda de lockout: papel Administrador (system) é imutável', () => {
    it('rejeita alterar as permissões do papel Administrador', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/roles/${adminRoleId}`)
        .set('Authorization', auth(adminToken))
        .send({ name: 'Administrador', permissions: [Permission.SALES_OPERATE] });

      expect(res.status).toBe(400);
    });

    it('permite alterar permissões de um papel não-system', async () => {
      const role = await request(app.getHttpServer())
        .post('/api/users/roles')
        .set('Authorization', auth(adminToken))
        .send({ name: 'Papel comum (teste)', permissions: [Permission.SALES_OPERATE] })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/users/roles/${role.body.id}`)
        .set('Authorization', auth(adminToken))
        .send({ name: 'Papel comum (teste)', permissions: [Permission.SALES_OPERATE, Permission.STOCK_READ] })
        .expect(200);
    });
  });

  describe('Guarda de permissão: USERS_MANAGE', () => {
    it('bloqueia listar usuários sem USERS_MANAGE', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', auth(noManageToken));
      expect(res.status).toBe(403);
    });

    it('bloqueia criar papel sem USERS_MANAGE', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users/roles')
        .set('Authorization', auth(noManageToken))
        .send({ name: 'Tentativa (teste)', permissions: [Permission.SALES_OPERATE] });
      expect(res.status).toBe(403);
    });
  });
});
