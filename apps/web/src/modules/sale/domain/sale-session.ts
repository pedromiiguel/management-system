import { PaymentMethod, type CompleteSaleBody, type DiscountInput } from '@beverage/shared';
import { NotFoundError } from '@domain/errors';
import type { ISaleGateway } from './sale-gateway';
import type { ICustomer, ISale, TAddSaleItemInput } from './sale-model';
import { salePricing } from './sale-pricing';
import { createSaleQueue, PendingQuantityError } from './sale-queue';

/** O que a sessão usa do gateway: a Venda em andamento, sem histórico nem estorno. */
export type TSaleSessionGateway = Pick<
  ISaleGateway,
  | 'open'
  | 'addItem'
  | 'updateQuantity'
  | 'removeItem'
  | 'setDiscount'
  | 'setServiceFee'
  | 'cancel'
  | 'complete'
>;

/**
 * Efeitos fora da sessão. Em produção viram toast, foco no campo de código e
 * invalidação do cache; nos testes, são só registrados.
 */
export interface ISaleSessionEvents {
  /** Aviso do servidor (ex.: estoque abaixo do mínimo); a operação valeu. */
  warn: (message: string) => void;
  /** A operação falhou. */
  error: (error: unknown) => void;
  /** Fim de cada operação, com sucesso ou não. */
  settled: () => void;
  /** A Venda foi concluída no servidor. */
  completed: (sale: ISale) => void | Promise<void>;
}

export interface ISaleCheckout {
  payment: PaymentMethod;
  /** Valor recebido em dinheiro; null = não informado. */
  amountReceived: number | null;
  /** Cliente do fiado. */
  customer: ICustomer | null;
  withInvoice: boolean;
}

export interface ISaleSessionState {
  sale: ISale | null;
  /** Quantidade exibida por item enquanto o servidor não confirma. */
  pendingQty: Record<string, number>;
  /** Abrindo a venda; sem venda e sem estar abrindo = a abertura falhou. */
  opening: boolean;
  adding: boolean;
  completing: boolean;
  checkout: ISaleCheckout;
  /** Formas de pagamento ligadas nas Configurações, na ordem da tela. */
  enabledPaymentMethods: readonly PaymentMethod[];
}

export type TAddItemResult =
  | { status: 'added'; itemId: string }
  | { status: 'not-found' }
  | { status: 'failed' };

/** Por que a conclusão não foi enviada ao servidor. */
export type TCompletionBlock = 'empty' | 'cash-missing' | 'customer-missing' | 'payment-disabled';

export type TCompleteResult =
  | { status: 'completed'; sale: ISale }
  | { status: 'blocked'; reason: TCompletionBlock }
  /** Já havia uma conclusão em andamento (F10 repetido). */
  | { status: 'busy' }
  | { status: 'failed' };

/** Ordem da tela; Dinheiro é a forma inicial quando ligada. */
export const PAYMENT_METHOD_ORDER: readonly PaymentMethod[] = [
  PaymentMethod.CASH,
  PaymentMethod.PIX,
  PaymentMethod.CARD,
  PaymentMethod.CREDIT,
];

/**
 * Venda em andamento no PDV, sem React: a Venda, a fila de operações, o
 * checkout (forma de pagamento, valor recebido, cliente, nota) e as regras de
 * conclusão.
 *
 * - Toda operação no servidor roda em fila, uma por vez (ver `sale-queue.ts`).
 * - Alterar quantidade é otimista e confirmada antes de qualquer outra operação.
 * - Só se conclui com itens, forma de pagamento ligada, dinheiro que cubra o
 *   Total (em centavos, pelo `priceSale`) e cliente no fiado.
 */
export function createSaleSession(options: {
  gateway: TSaleSessionGateway;
  events: ISaleSessionEvents;
  quantityDelayMs: number;
}) {
  const { gateway, events } = options;
  const listeners = new Set<() => void>();
  let completingGuard = false;

  let state: ISaleSessionState = {
    sale: null,
    pendingQty: {},
    // Começa "abrindo": o PDV chama `open` ao montar.
    opening: true,
    adding: false,
    completing: false,
    checkout: initialCheckout(PAYMENT_METHOD_ORDER),
    enabledPaymentMethods: PAYMENT_METHOD_ORDER,
  };

  function update(patch: Partial<ISaleSessionState>) {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  }

  function updateCheckout(patch: Partial<ISaleCheckout>) {
    update({ checkout: { ...state.checkout, ...patch } });
  }

  function current(): ISale {
    if (!state.sale) throw new Error('Nenhuma venda em andamento');
    return state.sale;
  }

  const queue = createSaleQueue({
    delayMs: options.quantityDelayMs,
    commitQuantity: async (itemId, quantity) => {
      const saleId = state.sale?.id;
      if (!saleId) return;
      const result = await gateway.updateQuantity(saleId, itemId, quantity);
      update({ sale: result.sale });
      if (result.warning) events.warn(result.warning);
    },
    onQuantityError: events.error,
    onPendingChange: (pendingQty) => update({ pendingQty }),
  });

  /** Roda na fila; erro vai para `events.error` e o resultado vira `undefined`. */
  async function perform<T>(task: () => Promise<T>): Promise<T | undefined> {
    try {
      return await queue.run(task);
    } catch (error) {
      if (!(error instanceof PendingQuantityError)) events.error(error);
      return undefined;
    } finally {
      events.settled();
    }
  }

  /** Troca a Venda (aberta, cancelada ou concluída): descarta o pendente e zera o checkout. */
  function replaceSale(next: ISale | null) {
    queue.reset();
    update({ sale: next, checkout: initialCheckout(state.enabledPaymentMethods) });
  }

  function isEnabled(method: PaymentMethod) {
    return state.enabledPaymentMethods.includes(method);
  }

  /** Corpo da conclusão a partir da Venda já com as quantidades confirmadas. */
  function completionBody(sale: ISale): CompleteSaleBody | TCompletionBlock {
    const { payment, amountReceived, customer, withInvoice } = state.checkout;
    if (sale.items.length === 0) return 'empty';
    if (!isEnabled(payment)) return 'payment-disabled';
    if (payment === PaymentMethod.CASH) {
      const change = amountReceived === null ? null : salePricing(sale, amountReceived).change;
      if (change === null || change < 0) return 'cash-missing';
      return { paymentMethod: payment, withInvoice, amountPaid: amountReceived! };
    }
    if (payment === PaymentMethod.CREDIT) {
      if (!customer) return 'customer-missing';
      return { paymentMethod: payment, withInvoice, customerId: customer.id };
    }
    return { paymentMethod: payment, withInvoice };
  }

  return {
    getSnapshot: (): ISaleSessionState => state,

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /** Abre a venda em andamento do operador (ou retoma a que já existe). */
    async open() {
      update({ opening: true });
      try {
        await perform(async () => replaceSale(await gateway.open()));
      } finally {
        update({ opening: false });
      }
    },

    /** Bipar: soma a quantidade se o produto já está na venda. */
    async addItem(input: TAddSaleItemInput): Promise<TAddItemResult> {
      update({ adding: true });
      try {
        return await queue.run(async () => {
          const { sale, itemId, warning } = await gateway.addItem(current().id, input);
          update({ sale });
          if (warning) events.warn(warning);
          return { status: 'added' as const, itemId };
        });
      } catch (error) {
        // Código sem cadastro exato (EAN/SKU/id): o PDV cai na busca por nome.
        if (error instanceof NotFoundError) return { status: 'not-found' };
        if (!(error instanceof PendingQuantityError)) events.error(error);
        return { status: 'failed' };
      } finally {
        update({ adding: false });
        events.settled();
      }
    },

    /** Alterar quantidade (sem motivo, sem rebipar). */
    setQuantity: (itemId: string, quantity: number) => queue.setQuantity(itemId, quantity),
    stepQuantity: (itemId: string, shown: number, delta: number) =>
      queue.stepQuantity(itemId, shown, delta),
    commitQuantities: () => queue.commitPending().finally(events.settled),

    /** Remover item: reversível, não mexe em estoque nem valores. */
    removeItem: (itemId: string) =>
      perform(async () => {
        const sale = await gateway.removeItem(current().id, itemId);
        update({ sale });
        return sale;
      }),

    setDiscount: (discount: DiscountInput | null) =>
      perform(async () => {
        const sale = await gateway.setDiscount(current().id, discount);
        update({ sale });
        return sale;
      }),

    /** Taxa de serviço: liga/desliga na própria Venda — o Total já volta com ela. */
    setServiceFee: (enabled: boolean) =>
      perform(async () => {
        const sale = await gateway.setServiceFee(current().id, enabled);
        update({ sale });
        return sale;
      }),

    /** Cancelar (venda em andamento): descarta e já abre a próxima. */
    cancel: () =>
      perform(async () => {
        await gateway.cancel(current().id);
        replaceSale(null);
        replaceSale(await gateway.open());
        return true as const;
      }),

    /**
     * Escolhe a forma de pagamento. Forma desligada nas Configurações é
     * ignorada (devolve false).
     */
    selectPayment(method: PaymentMethod): boolean {
      if (!isEnabled(method)) return false;
      updateCheckout({ payment: method });
      return true;
    },

    setAmountReceived(amount: number | null) {
      updateCheckout({
        amountReceived: amount !== null && Number.isFinite(amount) ? amount : null,
      });
    },

    /** Cliente do fiado: escolher um já passa a forma para Fiado. */
    setCustomer(customer: ICustomer) {
      if (!isEnabled(PaymentMethod.CREDIT)) return;
      updateCheckout({ customer, payment: PaymentMethod.CREDIT });
    },

    setWithInvoice(withInvoice: boolean) {
      updateCheckout({ withInvoice });
    },

    /**
     * Formas ligadas nas Configurações. Se a escolhida foi desligada, volta
     * para a primeira ligada.
     */
    setEnabledPaymentMethods(methods: readonly PaymentMethod[]) {
      const enabled = PAYMENT_METHOD_ORDER.filter((method) => methods.includes(method));
      if (sameMethods(enabled, state.enabledPaymentMethods)) return;
      const payment = enabled.includes(state.checkout.payment)
        ? state.checkout.payment
        : (enabled[0] ?? state.checkout.payment);
      update({ enabledPaymentMethods: enabled, checkout: { ...state.checkout, payment } });
    },

    /** Conclui a Venda com o checkout atual, depois de confirmar as quantidades. */
    async complete(): Promise<TCompleteResult> {
      // Uma conclusão por vez: F10/Enter repetidos não enfileiram outra.
      if (completingGuard) return { status: 'busy' };
      if (!state.sale) return { status: 'blocked', reason: 'empty' };
      completingGuard = true;
      try {
        const result = await perform(async (): Promise<TCompleteResult> => {
          const body = completionBody(current());
          if (typeof body === 'string') return { status: 'blocked', reason: body };
          update({ completing: true });
          try {
            const sale = await gateway.complete(current().id, body);
            replaceSale(null);
            await events.completed(sale);
            return { status: 'completed', sale };
          } finally {
            update({ completing: false });
          }
        });
        return result ?? { status: 'failed' };
      } finally {
        completingGuard = false;
      }
    },
  };
}

export type TSaleSession = ReturnType<typeof createSaleSession>;

function initialCheckout(enabled: readonly PaymentMethod[]): ISaleCheckout {
  return {
    payment: enabled[0] ?? PaymentMethod.CASH,
    amountReceived: null,
    customer: null,
    withInvoice: true,
  };
}

function sameMethods(a: readonly PaymentMethod[], b: readonly PaymentMethod[]) {
  return a.length === b.length && a.every((method, i) => method === b[i]);
}
