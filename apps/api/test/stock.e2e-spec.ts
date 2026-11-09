import { StockMovementSource, StockMovementType } from '@beverage/shared';
import { createTestApp, TestApp } from './support/app';

/**
 * Estoque: Entrada é aditiva e cria lote; Ajustar nunca deixa o saldo
 * negativo e, para menos, consome lotes em FEFO. Cada teste confere saldo,
 * movimento e lotes — não só o status HTTP.
 */
describe('Stock', () => {
  let t: TestApp;
  let seq = 0;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  async function createProduct(stock = 0) {
    seq += 1;
    const created = await t
      .as(t.adminToken)
      .post('/api/products')
      .send({
        name: `Produto estoque ${seq}`,
        sku: `TEST-STK-${seq}`,
        unit: 'un',
        purchasePrice: 1,
        salePrice: 2,
        ...(stock > 0 ? { stockEntry: { quantity: stock } } : {}),
      })
      .expect(201);
    return created.body.id as string;
  }

  const product = (id: string) =>
    t.prisma.product.findUniqueOrThrow({ where: { id }, include: { batches: true } });

  describe('Entrada (POST /stock/entries)', () => {
    it('soma ao saldo, cria lote e atualiza o preço de compra pelo custo', async () => {
      const id = await createProduct(5);
      const res = await t
        .as(t.adminToken)
        .post('/api/stock/entries')
        .send({ productId: id, quantity: 7, unitCost: 1.8, batch: 'L-1', expiresAt: '2030-01-01' })
        .expect(201);
      expect(res.body.currentStock).toBe(12);

      const p = await product(id);
      expect(p.currentStock).toBe(12);
      expect(p.purchasePrice.toNumber()).toBe(1.8);
      expect(p.batches.map((b) => b.quantity)).toEqual([7]);
      expect(res.body.movement).toMatchObject({
        type: StockMovementType.ENTRY,
        source: StockMovementSource.PURCHASE,
        quantity: 7,
        unitCost: 1.8,
      });
    });
  });

  describe('Ajustar (POST /stock/adjustments)', () => {
    it('rejeita ajuste que deixaria o estoque negativo', async () => {
      const id = await createProduct(5);
      await t
        .as(t.adminToken)
        .post('/api/stock/adjustments')
        .send({ productId: id, quantity: -10, reason: 'contagem de inventário' })
        .expect(400);
      expect((await product(id)).currentStock).toBe(5);
    });

    it('permite ajuste negativo que não deixa o estoque negativo', async () => {
      const id = await createProduct(5);
      await t
        .as(t.adminToken)
        .post('/api/stock/adjustments')
        .send({ productId: id, quantity: -3, reason: 'quebra' })
        .expect(201);
      expect((await product(id)).currentStock).toBe(2);
    });

    it('caso limite: ajuste que zera o estoque exatamente é aceito', async () => {
      const id = await createProduct(5);
      await t
        .as(t.adminToken)
        .post('/api/stock/adjustments')
        .send({ productId: id, quantity: -5, reason: 'perda total' })
        .expect(201);
      expect((await product(id)).currentStock).toBe(0);
    });

    it('permite ajuste positivo, registrando o motivo', async () => {
      const id = await createProduct(5);
      const res = await t
        .as(t.adminToken)
        .post('/api/stock/adjustments')
        .send({ productId: id, quantity: 10, reason: 'contagem de inventário' })
        .expect(201);
      expect(res.body).toMatchObject({
        type: StockMovementType.ENTRY,
        source: StockMovementSource.ADJUSTMENT,
        quantity: 10,
        note: 'contagem de inventário',
      });
      expect((await product(id)).currentStock).toBe(15);
    });

    it('ajuste para menos consome lotes em FEFO', async () => {
      const id = await createProduct();
      for (const [batch, expiresAt] of [
        ['TARDE', '2031-01-01'],
        ['CEDO', '2030-01-01'],
      ]) {
        await t
          .as(t.adminToken)
          .post('/api/stock/entries')
          .send({ productId: id, quantity: 4, batch, expiresAt })
          .expect(201);
      }
      await t
        .as(t.adminToken)
        .post('/api/stock/adjustments')
        .send({ productId: id, quantity: -5, reason: 'quebra' })
        .expect(201);

      const batches = Object.fromEntries(
        (await product(id)).batches.map((b) => [b.batch, b.quantity]),
      );
      expect(batches).toEqual({ CEDO: 0, TARDE: 3 });
    });
  });
});
