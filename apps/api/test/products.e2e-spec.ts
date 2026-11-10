import { PaymentMethod, Permission } from '@beverage/shared';
import { createTestApp, TestApp } from './support/app';

/**
 * Produtos: Entrada embutida no cadastro exige também STOCK_WRITE; Excluir só
 * vale para produto sem venda registrada (BR-04), levando junto as linhas de
 * estoque; edição parcial não reescreve o que não foi enviado.
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
    it('permite excluir produto sem venda', async () => {
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
      expect(await t.prisma.product.count({ where: { id: created.body.id } })).toBe(1);
    });

    it('exclui produto com Entrada e lote mas sem venda, junto com as linhas de estoque', async () => {
      const created = await t
        .as(t.adminToken)
        .post('/api/products')
        .send(productBody({ stockEntry: { quantity: 3, batch: 'L1', expiresAt: '2030-01-01' } }))
        .expect(201);
      const productId = created.body.id;
      await t
        .as(t.adminToken)
        .post('/api/stock/adjustments')
        .send({ productId, quantity: -1, reason: 'quebra' })
        .expect(201);
      expect(await t.prisma.stockMovement.count({ where: { productId } })).toBe(2);

      await t.as(t.adminToken).delete(`/api/products/${productId}`).expect(200);
      expect(await t.prisma.product.count({ where: { id: productId } })).toBe(0);
      expect(await t.prisma.stockMovement.count({ where: { productId } })).toBe(0);
      expect(await t.prisma.productBatch.count({ where: { productId } })).toBe(0);
      expect(await t.prisma.stockMovementBatch.count({ where: { movement: { productId } } })).toBe(
        0,
      );
    });
  });
});
