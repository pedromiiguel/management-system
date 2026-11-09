import { ALL_PERMISSIONS, Permission } from '@beverage/shared';
import { createTestApp, TestApp } from './support/app';

/**
 * Login rejeita usuário inexistente, inativo ou com senha errada com a mesma
 * mensagem (sem enumeração de usuário). Permissões e status do usuário são
 * resolvidos a cada requisição, não congelados no token.
 */
describe('Auth', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  async function createUser(login: string, active: boolean) {
    const role = await t
      .as(t.adminToken)
      .post('/api/users/roles')
      .send({ name: `Papel ${login}`, permissions: [Permission.SALES_OPERATE] })
      .expect(201);
    const created = await t
      .as(t.adminToken)
      .post('/api/users')
      .send({ name: login, login, password: 'senha123', roleId: role.body.id, active })
      .expect(201);
    return { userId: created.body.id as string, roleId: role.body.id as string };
  }

  describe('Guarda: usuário inativo não pode logar mesmo com senha correta', () => {
    it('rejeita login de usuário inativo (401)', async () => {
      await createUser('inativo-teste', false);

      const res = await t
        .http()
        .post('/api/auth/login')
        .send({ login: 'inativo-teste', password: 'senha123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Login ou senha inválidos');
    });

    it('controle: usuário ativo com senha correta autentica normalmente', async () => {
      await createUser('ativo-teste', true);

      const res = await t
        .http()
        .post('/api/auth/login')
        .send({ login: 'ativo-teste', password: 'senha123' })
        .expect(201);

      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.user.login).toBe('ativo-teste');
      expect(res.body.user.permissions).toEqual([Permission.SALES_OPERATE]);
    });
  });

  describe('Permissões resolvidas por requisição', () => {
    it('desativar o usuário invalida o token na hora', async () => {
      const { userId } = await createUser('desativado-depois', true);
      const token = await t.login('desativado-depois', 'senha123');
      await t.as(token).get('/api/auth/me').expect(200);

      await t.as(t.adminToken).patch(`/api/users/${userId}`).send({ active: false }).expect(200);

      await t.as(token).get('/api/auth/me').expect(401);
    });

    it('mudar as permissões do papel vale sem novo login', async () => {
      const { roleId } = await createUser('papel-muda', true);
      const token = await t.login('papel-muda', 'senha123');
      await t.as(token).get('/api/stock/alerts').expect(403);

      await t
        .as(t.adminToken)
        .patch(`/api/users/roles/${roleId}`)
        .send({ permissions: [Permission.SALES_OPERATE, Permission.STOCK_READ] })
        .expect(200);

      await t.as(token).get('/api/stock/alerts').expect(200);
    });

    it('Administrador tem o catálogo inteiro de permissões, sem depender do seed', async () => {
      await t.prisma.role.update({
        where: { name: 'Administrador' },
        data: { permissions: [] },
      });
      const me = await t.as(t.adminToken).get('/api/auth/me').expect(200);
      expect([...me.body.permissions].sort()).toEqual([...ALL_PERMISSIONS].sort());
    });
  });
});
