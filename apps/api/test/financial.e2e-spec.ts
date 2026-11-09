import { CashMovementType, PaymentMethod, storeDateKey } from '@beverage/shared';
import { FIXTURES, SEED_IDS } from '../prisma/seed/seed-data';
import { createTestApp, TestApp } from './support/app';

/**
 * Financeiro: caixa (BR-06), contas a pagar, fiado (BR-08), lançamento avulso
 * e painel. Cada bloco parte do seed (base + fixtures); dentro de "Caixa" os
 * passos são um roteiro de turno e seguem em ordem.
 */
describe('Financial', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  const admin = () => t.as(t.adminToken);
  const today = () => storeDateKey(new Date());

  describe('Caixa (BR-06) — roteiro de um turno', () => {
    beforeAll(() => t.reset());

    it('rejeita abrir caixa quando já existe um aberto', async () => {
      await admin().post('/api/cash-register/open').send({ openingBalance: 50 }).expect(409);
    });

    it('acumula sangria/suprimento no saldo esperado em dinheiro', async () => {
      await admin()
        .post('/api/cash-register/movements')
        .send({ type: CashMovementType.FLOAT, amount: 50, description: 'Suprimento' })
        .expect(201);
      await admin()
        .post('/api/cash-register/movements')
        .send({ type: CashMovementType.PULL, amount: 30, description: 'Sangria' })
        .expect(201);

      const current = await admin().get('/api/cash-register/current').expect(200);
      // abertura das fixtures + 50 (suprimento) − 30 (sangria)
      expect(current.body.summary.expectedCash).toBe(FIXTURES.openRegister.openingBalance + 20);
    });

    it('fecha o caixa e calcula a diferença contra o saldo esperado', async () => {
      const res = await admin()
        .post('/api/cash-register/close')
        .send({ countedBalance: 125 })
        .expect(201);
      expect(res.body.expectedBalance).toBe(120);
      expect(res.body.difference).toBe(5);
    });

    it('rejeita movimento de caixa sem caixa aberto', async () => {
      await admin()
        .post('/api/cash-register/movements')
        .send({ type: CashMovementType.FLOAT, amount: 10, description: 'x' })
        .expect(404);
    });

    it('permite reabrir o caixa depois de fechado, e o fechamento anterior aparece no histórico', async () => {
      await admin().post('/api/cash-register/open').send({ openingBalance: 200 }).expect(201);

      const history = await admin().get('/api/cash-register/history').expect(200);
      expect(history.body.find((r: { difference: number }) => r.difference === 5)).toBeDefined();
    });
  });

  describe('Contas a pagar', () => {
    let payableId: string;

    beforeAll(async () => {
      await t.reset();
      const res = await admin()
        .post('/api/payables')
        .send({ description: 'Fornecedor teste', amount: 80, dueDate: new Date().toISOString() })
        .expect(201);
      payableId = res.body.id;
    });

    it('categoria inexistente é referência inválida (400), não conflito', async () => {
      const res = await admin()
        .post('/api/payables')
        .send({
          description: 'Categoria errada',
          amount: 10,
          dueDate: today(),
          categoryId: 'nao-existe',
        })
        .expect(400);
      expect(res.body.message).toMatch(/^Referência inválida/);
    });

    it('cria a conta em aberto', async () => {
      const open = await admin().get('/api/payables').expect(200);
      expect(open.body.find((p: { id: string }) => p.id === payableId).status).toBe('OPEN');
    });

    it('paga a conta — gera saída no fluxo de caixa e marca como paga; não paga duas vezes', async () => {
      const res = await admin().post(`/api/payables/${payableId}/pay`).expect(201);
      expect(res.body.status).toBe('PAID');

      const flow = await admin()
        .get('/api/financial/cash-flow')
        .query({ from: today(), to: today() })
        .expect(200);
      const outflow = flow.body.movements.find((m: { description: string }) =>
        m.description.startsWith('Pagamento — Fornecedor teste'),
      );
      expect(outflow).toMatchObject({ amount: 80, cashRegisterId: null });

      await admin().post(`/api/payables/${payableId}/pay`).expect(409);
    });
  });

  describe('Fiado — liquidação (BR-08)', () => {
    let receivableId: string;

    beforeEach(async () => {
      await t.reset();
      const receivable = await t.prisma.accountReceivable.findFirstOrThrow({
        where: { customerId: SEED_IDS.fixtureCustomer, status: 'OPEN' },
      });
      receivableId = receivable.id;
    });

    it('rejeita liquidar em dinheiro sem caixa aberto', async () => {
      await admin().post('/api/cash-register/close').send({ countedBalance: 100 }).expect(201);
      await admin()
        .post(`/api/receivables/${receivableId}/settle`)
        .send({ paymentMethod: PaymentMethod.CASH })
        .expect(409);
    });

    it('liquida via PIX, gera entrada na categoria do sistema e não liquida duas vezes', async () => {
      const res = await admin()
        .post(`/api/receivables/${receivableId}/settle`)
        .send({ paymentMethod: PaymentMethod.PIX })
        .expect(201);
      expect(res.body.status).toBe('RECEIVED');

      const open = await admin().get('/api/receivables').query({ status: 'OPEN' }).expect(200);
      expect(open.body.find((r: { id: string }) => r.id === receivableId)).toBeUndefined();

      const inflow = await t.prisma.cashMovement.findFirstOrThrow({
        where: { type: CashMovementType.INFLOW },
        include: { category: true },
      });
      expect(inflow.amount.toNumber()).toBe(FIXTURES.openReceivable.amount);
      expect(inflow.category?.code).toBe('RECEIVABLE_SETTLEMENT');

      await admin()
        .post(`/api/receivables/${receivableId}/settle`)
        .send({ paymentMethod: PaymentMethod.PIX })
        .expect(409);
    });

    it('renomear a categoria do sistema não corta o vínculo', async () => {
      await t.prisma.financialCategory.update({
        where: { code: 'RECEIVABLE_SETTLEMENT' },
        data: { name: 'Fiado recebido' },
      });
      await admin()
        .post(`/api/receivables/${receivableId}/settle`)
        .send({ paymentMethod: PaymentMethod.PIX })
        .expect(201);
      const inflow = await t.prisma.cashMovement.findFirstOrThrow({ include: { category: true } });
      expect(inflow.category?.name).toBe('Fiado recebido');
    });
  });

  describe('Lançamento avulso e visão geral', () => {
    beforeEach(() => t.reset());

    it('cria um lançamento manual e ele aparece no fluxo de caixa do período', async () => {
      await admin()
        .post('/api/financial/entries')
        .send({ kind: 'EXPENSE', amount: 15, description: 'Lançamento avulso teste' })
        .expect(201);

      const flow = await admin()
        .get('/api/financial/cash-flow')
        .query({ from: today(), to: today() })
        .expect(200);
      const entry = flow.body.movements.find(
        (m: { description: string }) => m.description === 'Lançamento avulso teste',
      );
      expect(entry).toMatchObject({ amount: 15 });
      expect(flow.body.outflows).toBe(15);
    });

    it('lista as categorias financeiras do seed base', async () => {
      const res = await admin().get('/api/financial/categories').expect(200);
      expect(res.body.length).toBeGreaterThanOrEqual(8);
      expect(
        res.body.some((c: { name: string; system: boolean }) => c.name === 'Vendas' && c.system),
      ).toBe(true);
    });

    it('painel reflete despesas (conta paga + avulso) sem vendas (BR-01)', async () => {
      const payable = await admin()
        .post('/api/payables')
        .send({ description: 'Conta', amount: 80, dueDate: new Date().toISOString() })
        .expect(201);
      await admin().post(`/api/payables/${payable.body.id}/pay`).expect(201);
      await admin()
        .post('/api/financial/entries')
        .send({ kind: 'EXPENSE', amount: 15, description: 'Avulso' })
        .expect(201);

      const res = await admin().get('/api/financial/dashboard').expect(200);
      expect(res.body.revenue.month).toBe(0);
      expect(res.body.result.expenses).toBe(95);
      expect(res.body.result.profit).toBe(-95);
      expect(res.body.target).toEqual({ monthly: null, progress: null });
    });

    it('rejeita período inválido no fluxo de caixa', async () => {
      await admin().get('/api/financial/cash-flow').query({ from: 'ontem' }).expect(400);
    });
  });
});
