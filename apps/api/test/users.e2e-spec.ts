import { ALL_PERMISSIONS, Permission } from '@beverage/shared';
import { createTestApp, TestApp } from './support/app';

/**
 * Guarda de lockout: o papel de sistema (Administrador) tem sempre todas as
 * permissões — pode ser renomeado, mas não perder permissões. E o módulo
 * inteiro exige USERS_MANAGE.
 */
describe('Users', () => {
  let t: TestApp;
  let adminRoleId: string;

  beforeAll(async () => {
    t = await createTestApp();
    const roles = await t.as(t.adminToken).get('/api/users/roles/all').expect(200);
    adminRoleId = roles.body.find((r: { system: boolean }) => r.system).id;
  });

  afterAll(() => t.close());

  describe('Guarda de lockout: papel Administrador (system)', () => {
    it('rejeita retirar permissões do papel Administrador', async () => {
      const res = await t
        .as(t.adminToken)
        .patch(`/api/users/roles/${adminRoleId}`)
        .send({ name: 'Administrador', permissions: [Permission.SALES_OPERATE] });
      expect(res.status).toBe(400);
    });

    it('permite renomear o papel Administrador, que continua com tudo', async () => {
      const res = await t
        .as(t.adminToken)
        .patch(`/api/users/roles/${adminRoleId}`)
        .send({ name: 'Dono' })
        .expect(200);
      expect(res.body.name).toBe('Dono');
      expect(res.body.permissions).toHaveLength(ALL_PERMISSIONS.length);
    });

    it('permite alterar permissões de um papel não-system', async () => {
      const role = await t
        .as(t.adminToken)
        .post('/api/users/roles')
        .send({ name: 'Papel comum (teste)', permissions: [Permission.SALES_OPERATE] })
        .expect(201);
      await t
        .as(t.adminToken)
        .patch(`/api/users/roles/${role.body.id}`)
        .send({
          name: 'Papel comum (teste)',
          permissions: [Permission.SALES_OPERATE, Permission.STOCK_READ],
        })
        .expect(200);
    });

    it('rejeita permissão fora do catálogo', async () => {
      await t
        .as(t.adminToken)
        .post('/api/users/roles')
        .send({ name: 'Papel inválido', permissions: ['root'] })
        .expect(400);
    });
  });

  describe('Edição parcial de usuário', () => {
    it('PATCH só com o nome não reativa um usuário desativado', async () => {
      const role = await t
        .as(t.adminToken)
        .post('/api/users/roles')
        .send({ name: 'Papel patch (teste)', permissions: [Permission.SALES_OPERATE] })
        .expect(201);
      const user = await t
        .as(t.adminToken)
        .post('/api/users')
        .send({
          name: 'X',
          login: 'patch-parcial',
          password: 'senha123',
          roleId: role.body.id,
          active: false,
        })
        .expect(201);

      const res = await t
        .as(t.adminToken)
        .patch(`/api/users/${user.body.id}`)
        .send({ name: 'Novo nome' })
        .expect(200);
      expect(res.body.active).toBe(false);
    });
  });

  describe('Guarda de permissão: USERS_MANAGE', () => {
    let noManageToken: string;

    beforeAll(async () => {
      noManageToken = await t.userWith([Permission.SALES_OPERATE]);
    });

    it('bloqueia listar usuários sem USERS_MANAGE', async () => {
      await t.as(noManageToken).get('/api/users').expect(403);
    });

    it('bloqueia criar papel sem USERS_MANAGE', async () => {
      await t
        .as(noManageToken)
        .post('/api/users/roles')
        .send({ name: 'Tentativa (teste)', permissions: [Permission.SALES_OPERATE] })
        .expect(403);
    });
  });
});
