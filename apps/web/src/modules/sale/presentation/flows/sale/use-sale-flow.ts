import { useRef, useState } from 'react';
import type { CompleteSaleBody, DiscountInput } from '@beverage/shared';
import { NotFoundError } from '@domain/errors';
import { useInvalidate } from '@main/query/query-keys';
import { toast } from '@presentation/utils/toast';
import type { ISale, TAddSaleItemInput } from '@modules/sale/domain/sale-model';
import { makeSaleGateway } from '@modules/sale/main/sale-factory';
import { SALE_SETTLEMENT_EFFECTS } from '@modules/sale/main/sale-queries';
import { QUANTITY_DEBOUNCE_MS } from './constants';
import { createSaleQueue, PendingQuantityError } from './sale-queue';
import type { TAddItemResult } from './types';
import { messageOf } from './utils';

/**
 * Venda em andamento e seu protocolo: operações em fila, quantidades
 * otimistas confirmadas antes de qualquer outra operação, avisos/erros em
 * toast e `onSettled` ao fim de cada operação (o PDV devolve o foco ao
 * campo de código).
 */
export function useSaleFlow({ onSettled }: { onSettled: () => void }) {
  const [saleState, setSaleState] = useState<ISale | null>(null);
  const [pendingQtyState, setPendingQtyState] = useState<Record<string, number>>({});
  const [addingState, setAddingState] = useState(false);
  const [completingState, setCompletingState] = useState(false);
  // Começa "abrindo": o PDV chama `open` ao montar.
  const [openingState, setOpeningState] = useState(true);
  const completingRef = useRef(false);
  const saleRef = useRef<ISale | null>(null);
  const invalidateSettlement = useInvalidate(...SALE_SETTLEMENT_EFFECTS);
  const [gateway] = useState(makeSaleGateway);

  function current(next?: ISale | null): ISale {
    if (next !== undefined) {
      saleRef.current = next;
      setSaleState(next);
    }
    if (!saleRef.current) throw new Error('Nenhuma venda em andamento');
    return saleRef.current;
  }

  const [queue] = useState(() =>
    createSaleQueue({
      delayMs: QUANTITY_DEBOUNCE_MS,
      commitQuantity: async (itemId, quantity) => {
        const saleId = saleRef.current?.id;
        if (!saleId) return;
        const result = await gateway.updateQuantity(saleId, itemId, quantity);
        saleRef.current = result.sale;
        setSaleState(result.sale);
        if (result.warning) toast(result.warning, 'warn');
      },
      onQuantityError: (error) => toast(messageOf(error), 'danger'),
      onPendingChange: setPendingQtyState,
    }),
  );

  /** Roda na fila; erro vira toast e o resultado vira `undefined`. */
  async function perform<T>(task: () => Promise<T>): Promise<T | undefined> {
    try {
      return await queue.run(task);
    } catch (error) {
      if (!(error instanceof PendingQuantityError)) toast(messageOf(error), 'danger');
      return undefined;
    } finally {
      onSettled();
    }
  }

  function replaceSale(next: ISale | null) {
    queue.reset();
    saleRef.current = next;
    setSaleState(next);
  }

  return {
    sale: saleState,
    /** Quantidade exibida por item enquanto o servidor não confirma. */
    pendingQty: pendingQtyState,
    busy: addingState || completingState,
    completing: completingState,
    /** Abrindo a venda; sem venda e sem estar abrindo = a abertura falhou. */
    opening: openingState,

    /** Abre a venda em andamento do operador (ou retoma a que já existe). */
    async open() {
      setOpeningState(true);
      try {
        await perform(async () => replaceSale(await gateway.open()));
      } finally {
        setOpeningState(false);
      }
    },

    /** Bipar: soma a quantidade se o produto já está na venda. */
    async addItem(input: TAddSaleItemInput): Promise<TAddItemResult> {
      setAddingState(true);
      try {
        return await queue.run(async () => {
          const { sale: updated, itemId, warning } = await gateway.addItem(current().id, input);
          current(updated);
          if (warning) toast(warning, 'warn');
          return { status: 'added' as const, itemId };
        });
      } catch (error) {
        // Código sem cadastro exato (EAN/SKU/id): o PDV cai na busca por nome.
        if (error instanceof NotFoundError) return { status: 'not-found' };
        if (!(error instanceof PendingQuantityError)) toast(messageOf(error), 'danger');
        return { status: 'failed' };
      } finally {
        setAddingState(false);
        onSettled();
      }
    },

    /** Alterar quantidade (sem motivo, sem rebipar). */
    setQuantity: (itemId: string, quantity: number) => queue.setQuantity(itemId, quantity),
    stepQuantity: (itemId: string, shown: number, delta: number) =>
      queue.stepQuantity(itemId, shown, delta),
    commitQuantities: () => queue.commitPending().finally(onSettled),

    /** Remover item: reversível, não mexe em estoque nem valores. */
    removeItem: (itemId: string) =>
      perform(async () => current(await gateway.removeItem(current().id, itemId))),

    setDiscount: (discount: DiscountInput | null) =>
      perform(async () => current(await gateway.setDiscount(current().id, discount))),

    /** Taxa de serviço: liga/desliga na própria Venda — o total já volta com ela. */
    setServiceFee: (enabled: boolean) =>
      perform(async () => current(await gateway.setServiceFee(current().id, enabled))),

    /** Cancelar (venda em andamento): descarta e já abre a próxima. */
    cancel: () =>
      perform(async () => {
        await gateway.cancel(current().id);
        replaceSale(null);
        replaceSale(await gateway.open());
        return true;
      }),

    /**
     * Finaliza. `prepare` roda já com as quantidades confirmadas e decide o
     * pagamento a partir da venda atualizada (ou `null` para não finalizar).
     */
    complete: (prepare: (sale: ISale) => CompleteSaleBody | null) => {
      // Uma finalização por vez: F10/Enter repetidos não enfileiram outra.
      if (completingRef.current) return Promise.resolve(undefined);
      completingRef.current = true;
      return perform(async () => {
        const input = prepare(current());
        if (!input) return undefined;
        setCompletingState(true);
        try {
          const completed = await gateway.complete(current().id, input);
          replaceSale(null);
          await invalidateSettlement();
          return completed;
        } finally {
          setCompletingState(false);
        }
      }).finally(() => {
        completingRef.current = false;
      });
    },
  };
}

export type TSaleFlow = ReturnType<typeof useSaleFlow>;
