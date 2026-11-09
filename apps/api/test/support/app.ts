import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Permission } from '@beverage/shared';
import request from 'supertest';
import { ADMIN } from '../../prisma/seed/seed-data';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/config/configure-app';
import { SessionService } from '../../src/modules/auth/session.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { resetData } from './database';

export interface TestApp {
  app: INestApplication;
  prisma: PrismaService;
  /** Cliente HTTP já autenticado como `token`. */
  as(token: string): {
    get(url: string): request.Test;
    post(url: string): request.Test;
    patch(url: string): request.Test;
    put(url: string): request.Test;
    delete(url: string): request.Test;
  };
  http(): ReturnType<typeof request>;
  login(login: string, password: string): Promise<string>;
  adminToken: string;
  /** Volta o banco a seed base + fixtures e renova o token do admin. */
  reset(): Promise<void>;
  /** Cria papel + usuário com estas permissões e devolve o token dele. */
  userWith(permissions: Permission[]): Promise<string>;
  close(): Promise<void>;
}

/** A mesma app de produção (`configureApp`), sobre um banco recém-semeado. */
export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = configureApp(moduleRef.createNestApplication());
  await app.init();
  const prisma = app.get(PrismaService);
  const http = () => request(app.getHttpServer());
  let seq = 0;

  const login = async (user: string, password: string) => {
    const res = await http().post('/api/auth/login').send({ login: user, password }).expect(201);
    return res.body.accessToken as string;
  };

  const testApp: TestApp = {
    app,
    prisma,
    http,
    login,
    adminToken: '',
    as: (token) => {
      const auth = (t: request.Test) => t.set('Authorization', `Bearer ${token}`);
      return {
        get: (url) => auth(http().get(url)),
        post: (url) => auth(http().post(url)),
        patch: (url) => auth(http().patch(url)),
        put: (url) => auth(http().put(url)),
        delete: (url) => auth(http().delete(url)),
      };
    },
    async reset() {
      await resetData(prisma);
      app.get(SessionService).invalidate();
      testApp.adminToken = await login(ADMIN.login, ADMIN.password);
    },
    async userWith(permissions) {
      seq += 1;
      const admin = testApp.as(testApp.adminToken);
      const role = await admin
        .post('/api/users/roles')
        .send({ name: `Papel de teste ${seq} (${Date.now()})`, permissions })
        .expect(201);
      const userLogin = `teste-${seq}-${Date.now()}`;
      await admin
        .post('/api/users')
        .send({
          name: `Teste ${seq}`,
          login: userLogin,
          password: 'senha123',
          roleId: role.body.id,
        })
        .expect(201);
      return login(userLogin, 'senha123');
    },
    close: () => app.close(),
  };
  await testApp.reset();
  return testApp;
}
