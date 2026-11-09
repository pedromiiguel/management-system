import {
  CashMovementType,
  DiscountType,
  PaymentMethod,
  Permission,
  SaleStatus,
  StockMovementSource,
  StockMovementType,
  storeDateKey,
} from '@beverage/shared';
import { createTestApp, TestApp } from './support/app';

/**
 * Venda: precificação (desconto, Taxa de serviço, troco), Estornar (BR-05)
 * e a definição única de receita usada por painel e relatórios.
 */
describe('Sales', () => {
  let t: TestApp;
  let seq = 0;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  const admin = () => t.as(t.adminToken);

  /** Produto com Entrada inicial; devolve id e SKU (usado como código de busca). */
  async function createProduct(stock: number, extra: Record<string, unknown> = {}) {
    seq += 1;
    const sku = `TEST-SALE-${seq}`;
    const created = await admin()
      .post('/api/products')
      .send({
        name: `Produto venda ${seq}`,
        sku,
        unit: 'un',
        purchasePrice: 5,
        salePrice: 10,
        stockEntry: { quantity: stock },
        ...extra,
      })
      .expect(201);
    return { id: created.body.id as string, sku };
  }

  async function openSaleWith(sku: string, quantity: number) {
    const opened = await admin().post('/api/sales').expect(201);
    const saleId = opened.body.id as string;
    await admin().post(`/api/sales/${saleId}/items`).send({ code: sku, quantity }).expect(201);
    return saleId;
  }

  async function completeSale(
    sku: string,
    quantity: number,
    body: {
      paymentMethod: PaymentMethod;
      customerId?: string;
      amountPaid?: number;
      serviceFee?: boolean;
    },
  ) {
    const saleId = await openSaleWith(sku, quantity);
    const completed = await admin().post(`/api/sales/${saleId}/complete`).send(body).expect(201);
    return completed.body as { id: string; total: number; status: SaleStatus };
  }

  async function createCustomer() {
    seq += 1;
    const created = await admin()
      .post('/api/customers')
      .send({ name: `Cliente teste ${seq}` })
      .expect(201);
    return created.body.id as string;
  }

  const currentStock = async (productId: string) =>
    (await t.prisma.product.findUniqueOrThrow({ where: { id: productId } })).currentStock;

  describe('Precificação', () => {
    it('total é sempre o valor devido: inclui a Taxa de serviço assim que ligada', async () => {
      const product = await createProduct(10);
      const saleId = await openSaleWith(product.sku, 3); // 30,00

      const discounted = await admin()
        .put(`/api/sales/${saleId}/discount`)
        .send({ type: DiscountType.AMOUNT, value: 5 })
        .expect(200);
      expect(discounted.body).toMatchObject({ subtotal: 30, total: 25, serviceFee: null });

      const withFee = await admin()
        .put(`/api/sales/${saleId}/service-fee`)
        .send({ enabled: true })
        .expect(200);
      expect(withFee.body).toMatchObject({ subtotal: 30, serviceFee: 3, total: 28 });

      const completed = await admin()
        .post(`/api/sales/${saleId}/complete`)
        .send({ paymentMethod: PaymentMethod.CASH, amountPaid: 50 })
        .expect(201);
      expect(completed.body).toMatchObject({
        total: 28,
        serviceFee: 3,
        change: 22,
        amountPaid: 50,
      });
    });

    it('rejeita dinheiro recebido menor que o total', async () => {
      const product = await createProduct(10);
      const saleId = await openSaleWith(product.sku, 1);
      await admin()
        .post(`/api/sales/${saleId}/complete`)
        .send({ paymentMethod: PaymentMethod.CASH, amountPaid: 9.99 })
        .expect(400);
    });

    it('Bipar devolve o item bipado — o mesmo ao somar a quantidade', async () => {
      const product = await createProduct(10);
      const opened = await admin().post('/api/sales').expect(201);
      const first = await admin()
        .post(`/api/sales/${opened.body.id}/items`)
        .send({ code: product.sku, quantity: 1 })
        .expect(201);
      const again = await admin()
        .post(`/api/sales/${opened.body.id}/items`)
        .send({ code: product.sku, quantity: 2 })
        .expect(201);
      expect(again.body.itemId).toBe(first.body.itemId);
      expect(again.body.sale.items).toContainEqual(
        expect.objectContaining({ id: first.body.itemId, quantity: 3 }),
      );
    });

    it('dinheiro sem valor recebido e fiado sem cliente são recusados pelo contrato', async () => {
      const product = await createProduct(10);
      const saleId = await openSaleWith(product.sku, 1);
      const cash = await admin()
        .post(`/api/sales/${saleId}/complete`)
        .send({ paymentMethod: PaymentMethod.CASH })
        .expect(400);
      expect(JSON.stringify(cash.body)).toContain('Informe o valor recebido em dinheiro');
      const credit = await admin()
        .post(`/api/sales/${saleId}/complete`)
        .send({ paymentMethod: PaymentMethod.CREDIT })
        .expect(400);
      expect(JSON.stringify(credit.body)).toContain('Venda a prazo exige cliente');
    });

    it('aberturas simultâneas retomam a mesma Venda em andamento do operador', async () => {
      const [a, b] = await Promise.all([
        admin().post('/api/sales').expect(201),
        admin().post('/api/sales').expect(201),
      ]);
      expect(a.body.id).toBe(b.body.id);
    });

    it('com política BLOCK, bipar além do saldo é recusado', async () => {
      const product = await createProduct(2);
      const opened = await admin().post('/api/sales').expect(201);
      const res = await admin()
        .post(`/api/sales/${opened.body.id}/items`)
        .send({ code: product.sku, quantity: 3 })
        .expect(409);
      expect(res.body.message).toContain('Estoque insuficiente');
    });
  });

  describe('BR-05: Estornar venda concluída', () => {
    it('venda à vista (PIX) — status VOIDED, estoque volta e há saída no caixa aberto', async () => {
      const product = await createProduct(10);
      const sale = await completeSale(product.sku, 3, { paymentMethod: PaymentMethod.PIX });
      expect(await currentStock(product.id)).toBe(7);

      const voided = await admin().post(`/api/sales/${sale.id}/void`).expect(201);
      expect(voided.body.status).toBe(SaleStatus.VOIDED);
      expect(voided.body.voidedAt).toBeTruthy();
      expect(voided.body.cancelledAt).toBeNull();
      expect(await currentStock(product.id)).toBe(10);
      const returned = await t.prisma.stockMovement.findFirstOrThrow({
        where: { saleId: sale.id, type: StockMovementType.ENTRY },
      });
      expect(returned.source).toBe(StockMovementSource.VOID);

      const today = storeDateKey(new Date());
      const cashFlow = await admin()
        .get('/api/financial/cash-flow')
        .query({ from: today, to: today })
        .expect(200);
      const outflow = cashFlow.body.movements.find(
        (m: { type: string; saleId?: string }) =>
          m.type === CashMovementType.OUTFLOW && m.saleId === sale.id,
      );
      expect(outflow).toBeDefined();
      const open = await t.prisma.cashRegister.findFirstOrThrow({ where: { status: 'OPEN' } });
      expect(outflow.cashRegisterId).toBe(open.id);
    });

    it('devolve as quantidades aos mesmos lotes que a venda consumiu', async () => {
      const product = await createProduct(4, {
        stockEntry: { quantity: 4, batch: 'L-A', expiresAt: '2030-01-01' },
      });
      const sale = await completeSale(product.sku, 3, { paymentMethod: PaymentMethod.PIX });
      const batch = () =>
        t.prisma.productBatch.findFirstOrThrow({ where: { productId: product.id } });
      expect((await batch()).quantity).toBe(1);

      await admin().post(`/api/sales/${sale.id}/void`).expect(201);
      expect((await batch()).quantity).toBe(4);
    });

    it('estorno em dinheiro vai para o caixa aberto agora, nunca para um já fechado', async () => {
      const product = await createProduct(10);
      const sale = await completeSale(product.sku, 1, {
        paymentMethod: PaymentMethod.CASH,
        amountPaid: 10,
      });
      await admin().post('/api/cash-register/close').send({ countedBalance: 110 }).expect(201);

      // Sem caixa aberto não há de onde devolver o dinheiro.
      await admin().post(`/api/sales/${sale.id}/void`).expect(409);

      const reopened = await admin()
        .post('/api/cash-register/open')
        .send({ openingBalance: 50 })
        .expect(201);
      await admin().post(`/api/sales/${sale.id}/void`).expect(201);

      const refund = await t.prisma.cashMovement.findFirstOrThrow({
        where: { saleId: sale.id, type: CashMovementType.OUTFLOW },
      });
      expect(refund.cashRegisterId).toBe(reopened.body.id);
      const current = await admin().get('/api/cash-register/current').expect(200);
      expect(current.body.summary.expectedCash).toBe(40);
    });

    it('venda fiado (CREDIT) não recebida — reverte estoque e apaga o fiado', async () => {
      const product = await createProduct(10);
      const customerId = await createCustomer();
      const sale = await completeSale(product.sku, 2, {
        paymentMethod: PaymentMethod.CREDIT,
        customerId,
      });

      const before = await admin().get('/api/receivables').query({ customerId }).expect(200);
      expect(before.body.some((r: { saleId: string }) => r.saleId === sale.id)).toBe(true);

      await admin().post(`/api/sales/${sale.id}/void`).expect(201);
      expect(await currentStock(product.id)).toBe(10);

      const after = await admin().get('/api/receivables').query({ customerId }).expect(200);
      expect(after.body.some((r: { saleId: string }) => r.saleId === sale.id)).toBe(false);
    });

    it('guarda: fiado já recebido bloqueia o estorno', async () => {
      const product = await createProduct(10);
      const customerId = await createCustomer();
      const sale = await completeSale(product.sku, 1, {
        paymentMethod: PaymentMethod.CREDIT,
        customerId,
      });
      const receivables = await admin().get('/api/receivables').query({ customerId }).expect(200);
      const receivableId = receivables.body.find(
        (r: { saleId: string }) => r.saleId === sale.id,
      ).id;

      await admin()
        .post(`/api/receivables/${receivableId}/settle`)
        .send({ paymentMethod: PaymentMethod.PIX })
        .expect(201);

      await admin().post(`/api/sales/${sale.id}/void`).expect(409);
    });

    it('guarda: só vendas concluídas podem ser estornadas (rejeita reestorno)', async () => {
      const product = await createProduct(5);
      const sale = await completeSale(product.sku, 1, { paymentMethod: PaymentMethod.PIX });

      await admin().post(`/api/sales/${sale.id}/void`).expect(201);
      await admin().post(`/api/sales/${sale.id}/void`).expect(409);
    });

    it('guarda de permissão: SALES_OPERATE sem SALES_VOID não pode estornar', async () => {
      const noVoidToken = await t.userWith([Permission.SALES_OPERATE]);
      const product = await createProduct(5);
      const sale = await completeSale(product.sku, 1, { paymentMethod: PaymentMethod.PIX });

      await t.as(noVoidToken).post(`/api/sales/${sale.id}/void`).expect(403);
    });

    it('Cancelar venda em andamento grava CANCELLED, distinto do estorno', async () => {
      const product = await createProduct(5);
      const saleId = await openSaleWith(product.sku, 1);
      const res = await admin().post(`/api/sales/${saleId}/cancel`).expect(201);
      expect(res.body.status).toBe(SaleStatus.CANCELLED);
      expect(await currentStock(product.id)).toBe(5);
    });
  });

  describe('Receita: uma definição para painel e relatórios', () => {
    it('painel e relatório de vendas mostram a mesma receita, sem Taxa de serviço', async () => {
      await t.reset();
      const product = await createProduct(10);
      await completeSale(product.sku, 2, { paymentMethod: PaymentMethod.PIX, serviceFee: true }); // 20 + 2
      const voided = await completeSale(product.sku, 1, { paymentMethod: PaymentMethod.PIX });
      await admin().post(`/api/sales/${voided.id}/void`).expect(201);

      const today = storeDateKey(new Date());
      const report = await admin()
        .get('/api/reports/sales')
        .query({ from: today, to: today })
        .expect(200);
      const dashboard = await admin().get('/api/financial/dashboard').expect(200);

      expect(report.body).toMatchObject({ count: 1, revenue: 20, serviceFee: 2 });
      expect(report.body.days).toEqual([{ day: today, count: 1, revenue: 20, serviceFee: 2 }]);
      expect(dashboard.body.revenue.day).toBe(20);
      expect(dashboard.body.revenue.month).toBe(20);
      expect(dashboard.body.serviceFee.month).toBe(2);
      // A taxa fica com a casa: entra no resultado, e o cobrado por forma de pagamento é bruto.
      expect(dashboard.body.result).toMatchObject({ revenue: 20, serviceFee: 2 });
      expect(dashboard.body.byMethodMonth).toEqual([
        { paymentMethod: PaymentMethod.PIX, total: 22, count: 1 },
      ]);
      expect(dashboard.body.monthly).toHaveLength(6);
      expect(dashboard.body.monthly.at(-1)).toEqual({
        month: today.slice(0, 7),
        revenue: 20,
        serviceFee: 2,
      });

      const csv = await admin()
        .get('/api/reports/sales')
        .query({ from: today, to: today, format: 'csv' })
        .expect(200);
      expect(csv.text).toContain('Dia;Vendas;Receita (R$);Taxa de serviço (R$)');
      expect(csv.text).toContain(`${today};1;20,00;2,00`);
    });

    it('desempenho por produto mostra o valor bruto, antes do desconto da venda', async () => {
      await t.reset();
      const product = await createProduct(10); // venda 10,00, custo 5,00
      const saleId = await openSaleWith(product.sku, 3); // 30,00
      await admin()
        .put(`/api/sales/${saleId}/discount`)
        .send({ type: DiscountType.AMOUNT, value: 5 })
        .expect(200);
      await admin()
        .post(`/api/sales/${saleId}/complete`)
        .send({ paymentMethod: PaymentMethod.PIX })
        .expect(201);

      const today = storeDateKey(new Date());
      const report = await admin()
        .get('/api/reports/products')
        .query({ from: today, to: today })
        .expect(200);
      expect(report.body).toEqual([
        expect.objectContaining({
          quantity: 3,
          grossSales: 30,
          cost: 15,
          margin: 15,
          marginPercent: 50,
        }),
      ]);

      const csv = await admin()
        .get('/api/reports/products')
        .query({ from: today, to: today, format: 'csv' })
        .expect(200);
      expect(csv.text).toContain(
        'Produto;SKU;Qtd vendida;Valor bruto (R$);Custo (R$);Margem (R$);Margem (%)',
      );
      expect(csv.text).toContain(`;${product.sku};3;30,00;15,00;15,00;50`);
    });
  });
});
