import { PaymentMethod } from '@beverage/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { FakeSaleGateway } from './fake-sale-gateway';
import { createSaleSession } from './sale-session';

const customer = { id: 'c-1', name: 'Zé', contact: null, active: true, openBalance: 0 };

async function setup(catalog?: Record<string, number>) {
  const gateway = new FakeSaleGateway(catalog);
  const events = {
    warn: vi.fn(),
    error: vi.fn(),
    settled: vi.fn(),
    completed: vi.fn(),
  };
  const session = createSaleSession({ gateway, events, quantityDelayMs: 400 });
  await session.open();
  const state = () => session.getSnapshot();
  return { gateway, events, session, state };
}

describe('createSaleSession', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('opens the sale and notifies subscribers with a new snapshot', async () => {
    const { session, state } = await setup();
    expect(state().sale?.id).toBe('sale-1');
    expect(state().opening).toBe(false);

    const listener = vi.fn();
    session.subscribe(listener);
    const before = state();
    await session.addItem({ code: '789' });
    expect(listener).toHaveBeenCalled();
    expect(state()).not.toBe(before);
  });

  it('Bipar soma a quantidade do mesmo produto', async () => {
    const { session, state } = await setup();
    await session.addItem({ code: '789' });
    const result = await session.addItem({ code: '789', quantity: 2 });
    expect(result).toEqual({ status: 'added', itemId: 'item-1' });
    expect(state().sale?.items).toHaveLength(1);
    expect(state().sale?.items[0]?.quantity).toBe(3);
    expect(state().sale?.total).toBe(30);
  });

  it('código sem cadastro devolve not-found sem erro (o PDV cai na busca)', async () => {
    const { session, events } = await setup();
    expect(await session.addItem({ code: 'xyz' })).toEqual({ status: 'not-found' });
    expect(events.error).not.toHaveBeenCalled();
  });

  it('conclui em dinheiro com troco e zera o checkout', async () => {
    const { session, gateway, events, state } = await setup();
    await session.addItem({ code: '789', quantity: 2 });
    session.setWithInvoice(false);
    session.setAmountReceived(50);

    const result = await session.complete();

    expect(result.status).toBe('completed');
    expect(gateway.completed).toEqual([
      { paymentMethod: PaymentMethod.CASH, withInvoice: false, amountPaid: 50 },
    ]);
    expect(events.completed).toHaveBeenCalledOnce();
    expect(state().sale).toBeNull();
    expect(state().checkout).toEqual({
      payment: PaymentMethod.CASH,
      amountReceived: null,
      customer: null,
      withInvoice: true,
    });
  });

  it('bloqueia conclusão de venda vazia', async () => {
    const { session, gateway } = await setup();
    expect(await session.complete()).toEqual({ status: 'blocked', reason: 'empty' });
    expect(gateway.completed).toEqual([]);
  });

  it('dinheiro que não cobre o Total bloqueia, comparando em centavos', async () => {
    const { session, gateway } = await setup({ '789': 0.1 });
    await session.addItem({ code: '789', quantity: 3 }); // 0,1 × 3 = 0,30 (em float, 0.30000000000000004)
    session.setAmountReceived(0.29);
    expect(await session.complete()).toEqual({ status: 'blocked', reason: 'cash-missing' });
    session.setAmountReceived(0.3);
    expect((await session.complete()).status).toBe('completed');
    expect(gateway.completed[0]?.amountPaid).toBe(0.3);
  });

  it('dinheiro sem valor recebido bloqueia', async () => {
    const { session } = await setup();
    await session.addItem({ code: '789' });
    expect(await session.complete()).toEqual({ status: 'blocked', reason: 'cash-missing' });
  });

  it('fiado sem cliente bloqueia; com cliente, envia o customerId', async () => {
    const { session, gateway } = await setup();
    await session.addItem({ code: '789' });
    session.selectPayment(PaymentMethod.CREDIT);
    expect(await session.complete()).toEqual({ status: 'blocked', reason: 'customer-missing' });

    session.setCustomer(customer);
    expect((await session.complete()).status).toBe('completed');
    expect(gateway.completed[0]).toEqual({
      paymentMethod: PaymentMethod.CREDIT,
      withInvoice: true,
      customerId: 'c-1',
    });
  });

  it('F10 repetido não envia duas conclusões', async () => {
    const { session, gateway } = await setup();
    await session.addItem({ code: '789' });
    session.selectPayment(PaymentMethod.PIX);
    const [first, second] = await Promise.all([session.complete(), session.complete()]);
    expect(first.status).toBe('completed');
    expect(second).toEqual({ status: 'busy' });
    expect(gateway.completed).toHaveLength(1);
  });

  describe('formas de pagamento desligadas nas Configurações', () => {
    it('ignora a escolha de uma forma desligada', async () => {
      const { session, state } = await setup();
      session.setEnabledPaymentMethods([PaymentMethod.CASH, PaymentMethod.PIX]);
      expect(session.selectPayment(PaymentMethod.CARD)).toBe(false);
      session.setCustomer(customer);
      expect(state().checkout.payment).toBe(PaymentMethod.CASH);
      expect(state().checkout.customer).toBeNull();
      expect(state().enabledPaymentMethods).toEqual([PaymentMethod.CASH, PaymentMethod.PIX]);
    });

    it('desligar a forma escolhida volta para a primeira ligada, na ordem da tela', async () => {
      const { session, state } = await setup();
      session.selectPayment(PaymentMethod.CARD);
      session.setEnabledPaymentMethods([PaymentMethod.CREDIT, PaymentMethod.PIX]);
      expect(state().checkout.payment).toBe(PaymentMethod.PIX);
    });

    it('sem Dinheiro, a próxima venda começa na primeira forma ligada', async () => {
      const { session, state } = await setup();
      session.setEnabledPaymentMethods([PaymentMethod.CARD]);
      await session.addItem({ code: '789' });
      expect((await session.complete()).status).toBe('completed');
      await session.open();
      expect(state().checkout.payment).toBe(PaymentMethod.CARD);
    });
  });

  it('Alterar quantidade é otimista e só envia o último valor', async () => {
    const { session, state } = await setup();
    await session.addItem({ code: '789' });
    session.stepQuantity('item-1', 1, 1);
    session.stepQuantity('item-1', 1, 1);
    expect(state().pendingQty).toEqual({ 'item-1': 3 });
    await vi.advanceTimersByTimeAsync(400);
    expect(state().pendingQty).toEqual({});
    expect(state().sale?.items[0]?.quantity).toBe(3);
  });

  it('quantidade pendente que falha impede a conclusão', async () => {
    const { session, gateway, events } = await setup();
    await session.addItem({ code: '789' });
    session.selectPayment(PaymentMethod.PIX);
    gateway.failNextQuantity = new Error('Estoque insuficiente');
    session.setQuantity('item-1', 5);

    expect(await session.complete()).toEqual({ status: 'failed' });
    expect(gateway.completed).toEqual([]);
    expect(events.error).toHaveBeenCalledWith(new Error('Estoque insuficiente'));
  });

  it('Cancelar descarta a venda e já abre a próxima', async () => {
    const { session, state } = await setup();
    await session.addItem({ code: '789' });
    session.selectPayment(PaymentMethod.PIX);
    expect(await session.cancel()).toBe(true);
    expect(state().sale?.id).toBe('sale-2');
    expect(state().sale?.items).toEqual([]);
    expect(state().checkout.payment).toBe(PaymentMethod.CASH);
  });

  it('Remover tira o item sem afetar os outros', async () => {
    const { session, state } = await setup({ a: 1, b: 2 });
    await session.addItem({ code: 'a' });
    await session.addItem({ code: 'b' });
    await session.removeItem('item-1');
    expect(state().sale?.items.map((i) => i.productId)).toEqual(['b']);
    expect(state().sale?.total).toBe(2);
  });
});
