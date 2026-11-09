import { PaymentMethod, Permission } from '@beverage/shared';
import { createTestApp, TestApp } from './support/app';

/**
 * Produtos: Entrada embutida no cadastro exige também STOCK_WRITE; Excluir só
 * vale para cadastro sem histórico (BR-04); edição parcial não reescreve o
 * que não foi enviado.
 */
describe('Products', () => {
  let t: TestApp;
  let productsOnlyToken: string;
  let seq = 0;

  beforeAll(async () => {
    t = await createTestApp();
    productsOnlyToken = await t.userWith([Permission.PRODUCTS_WRITE]);
  });

  afterAll(() => t.close());

  function productBody(extra: Record<string, unknown> = {}) {
    seq += 1;
    return {
      name: `Produto teste ${seq}`,
      sku: `TEST-PROD-${seq}`,
      unit: 'un',
      purchasePrice: 1,
      salePrice: 2,
      ...extra,
    };
  }

  describe('Permissão dupla na entrada de estoque embutida', () => {
    it('permite criar produto sem stockEntry só com products.write', async () => {
      await t.as(productsOnlyToken).post('/api/products').send(productBody()).expect(201);
    });

    it('rejeita stockEntry quando falta stock.write', async () => {
      await t
        .as(productsOnlyToken)
        .post('/api/products')
        .send(productBody({ stockEntry: { quantity: 10 } }))
        .expect(403);
    });

    it('permite stockEntry com products.write e stock.write — e lança a Entrada', async () => {
      const res = await t
        .as(t.adminToken)
        .post('/api/products')
        .send(productBody({ purchasePrice: 3.25, stockEntry: { quantity: 10, batch: 'L1' } }))
        .expect(201);
      expect(res.body.currentStock).toBe(10);
      expect(res.body.batches).toHaveLength(1);

      const movements = await t.prisma.stockMovement.findMany({
        where: { productId: res.body.id },
      });
      expect(movements).toHaveLength(1);
      expect(movements[0]!.unitCost!.toNumber()).toBe(3.25);
    });

    it('mesma guarda vale para edição (update)', async () => {
      const created = await t
        .as(t.adminToken)
        .post('/api/products')
        .send(productBody())
        .expect(201);
      await t
        .as(productsOnlyToken)
        .patch(`/api/products/${created.body.id}`)
        .send({ stockEntry: { quantity: 5 } })
        .expect(403);
    });
  });

  describe('Edição parcial', () => {
    it('PATCH parcial não reativa, não zera o mínimo e não apaga o EAN', async () => {
      const created = await t
        .as(t.adminToken)
        .post('/api/products')
        .send(productBody({ ean: '7890000000017', minimumStock: 7 }))
        .expect(201);
      const id = created.body.id as string;
      await t.as(t.adminToken).patch(`/api/products/${id}/deactivate`).expect(200);

      const res = await t
        .as(t.adminToken)
        .patch(`/api/products/${id}`)
        .send({ salePrice: 5 })
        .expect(200);
      expect(res.body).toMatchObject({
        active: false,
        minimumStock: 7,
        ean: '7890000000017',
        salePrice: 5,
      });
    });

    it('EAN vazio remove o EAN', async () => {
      const created = await t
        .as(t.adminToken)
        .post('/api/products')
        .send(productBody({ ean: '7890000000024' }))
        .expect(201);
      const res = await t
        .as(t.adminToken)
        .patch(`/api/products/${created.body.id}`)
        .send({ ean: '' })
        .expect(200);
      expect(res.body.ean).toBeNull();
    });
  });

  describe('Excluir (BR-04)', () => {
    it('permite excluir produto sem histórico', async () => {
      const created = await t
        .as(t.adminToken)
        .post('/api/products')
        .send(productBody())
        .expect(201);
      await t.as(t.adminToken).delete(`/api/products/${created.body.id}`).expect(200);
    });

    it('rejeita excluir produto com venda registrada', async () => {
      const body = productBody({ stockEntry: { quantity: 10 } });
      const created = await t.as(t.adminToken).post('/api/products').send(body).expect(201);
      const sale = await t.as(t.adminToken).post('/api/sales').expect(201);
      await t
        .as(t.adminToken)
        .post(`/api/sales/${sale.body.id}/items`)
        .send({ code: body.sku, quantity: 1 })
        .expect(201);
      await t
        .as(t.adminToken)
        .post(`/api/sales/${sale.body.id}/complete`)
        .send({ paymentMethod: PaymentMethod.PIX })
        .expect(201);

      await t.as(t.adminToken).delete(`/api/products/${created.body.id}`).expect(400);
    });

    it('rejeita excluir produto com movimentação de estoque (preserva a auditoria)', async () => {
      const created = await t
        .as(t.adminToken)
        .post('/api/products')
        .send(productBody({ stockEntry: { quantity: 3 } }))
        .expect(201);
      await t.as(t.adminToken).delete(`/api/products/${created.body.id}`).expect(400);
      expect(await t.prisma.stockMovement.count({ where: { productId: created.body.id } })).toBe(1);
    });
  });
});
