/**
 * Protocolo da venda em andamento, sem React:
 *
 * - toda operação no servidor roda em fila, uma por vez;
 * - Alterar quantidade é otimista: a tela mostra o valor na hora e o envio
 *   espera `delayMs` sem novos cliques (evita 1 request por clique);
 * - antes de qualquer outra operação (remover, desconto, cancelar,
 *   finalizar…), as quantidades pendentes são enviadas. Se alguma falhar, a
 *   operação não roda — ela partiria de um carrinho diferente do da tela.
 */
export class PendingQuantityError extends Error {
  constructor() {
    super('Alteração de quantidade não confirmada');
    this.name = 'PendingQuantityError';
  }
}

export function createSaleQueue(options: {
  delayMs: number;
  commitQuantity: (itemId: string, quantity: number) => Promise<void>;
  onQuantityError: (error: unknown) => void;
  /** Quantidades exibidas que ainda não foram confirmadas pelo servidor. */
  onPendingChange: (pending: Record<string, number>) => void;
}) {
  let tail: Promise<unknown> = Promise.resolve();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  /** Última quantidade escolhida e ainda não enviada, por item. */
  const queued = new Map<string, number>();
  /** O que a tela mostra: enviado-mas-não-confirmado ou ainda em espera. */
  const shown = new Map<string, number>();

  const publish = () => options.onPendingChange(Object.fromEntries(shown));

  function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const result = tail.then(task);
    tail = result.catch(() => undefined);
    return result;
  }

  async function commit(itemId: string): Promise<boolean> {
    clearTimeout(timers.get(itemId));
    timers.delete(itemId);
    const quantity = queued.get(itemId);
    if (quantity === undefined) return true;
    queued.delete(itemId);
    try {
      await options.commitQuantity(itemId, quantity);
      return true;
    } catch (error) {
      options.onQuantityError(error);
      return false;
    } finally {
      if (!queued.has(itemId) && shown.get(itemId) === quantity) {
        shown.delete(itemId);
        publish();
      }
    }
  }

  /** Envia agora tudo o que está em espera. Só chamar dentro de um turno da fila. */
  async function flush(): Promise<boolean> {
    let ok = true;
    for (const itemId of [...queued.keys()]) {
      if (!(await commit(itemId))) ok = false;
    }
    return ok;
  }

  function setQuantity(itemId: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    clearTimeout(timers.get(itemId));
    queued.set(itemId, quantity);
    shown.set(itemId, quantity);
    timers.set(
      itemId,
      setTimeout(() => void enqueue(() => commit(itemId)), options.delayMs),
    );
    publish();
  }

  return {
    setQuantity,

    /** +/- parte do último valor exibido, não do último render: cliques rápidos somam. */
    stepQuantity(itemId: string, current: number, delta: number) {
      setQuantity(itemId, (shown.get(itemId) ?? current) + delta);
    },

    /** Envia já as quantidades em espera (ex.: ao sair do campo de quantidade). */
    commitPending(): Promise<void> {
      return enqueue(async () => {
        await flush();
      });
    },

    /** Roda `task` na fila, depois de confirmar as quantidades pendentes. */
    run<T>(task: () => Promise<T>): Promise<T> {
      return enqueue(async () => {
        if (!(await flush())) throw new PendingQuantityError();
        return task();
      });
    },

    /** Descarta o que estiver em espera (a venda acabou ou foi trocada). */
    reset() {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      queued.clear();
      shown.clear();
      publish();
    },
  };
}

export type SaleQueue = ReturnType<typeof createSaleQueue>;
