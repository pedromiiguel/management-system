import { useRef, useState } from 'react';
import type { CompleteSaleBody, DiscountInput } from '@beverage/shared';
import { toast } from '@/components/Toast';
import { ApiError } from '@/lib/http';
import { useInvalidate } from '@/lib/query-keys';
import { saleApi, SALE_SETTLEMENT_EFFECTS, type AddSaleItemInput, type Sale } from './api';
import { createSaleQueue, PendingQuantityError } from './sale-queue';

const QUANTITY_DEBOUNCE_MS = 400;

export type AddItemResult =
  | { status: 'added'; itemId: string }
  | { status: 'not-found' }
  | { status: 'failed' };

/**
 * Venda em andamento e seu protocolo: operações em fila, quantidades
 * otimistas confirmadas antes de qualquer outra operação, avisos/erros em
 * toast e `onSettled` ao fim de cada operação (o PDV devolve o foco ao
 * campo de código).
 */
export function useSaleFlow({ onSettled }: { onSettled: () => void }) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [pendingQty, setPendingQty] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState(false);
  const [completing, setCompleting] = useState(false);
  // Começa "abrindo": o PDV chama `open` ao montar.
  const [opening, setOpening] = useState(true);
  const completingRef = useRef(false);
  const saleRef = useRef<Sale | null>(null);
  const invalidateSettlement = useInvalidate(...SALE_SETTLEMENT_EFFECTS);

  function current(next?: Sale | null): Sale {
    if (next !== undefined) {
      saleRef.current = next;
      setSale(next);
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
        const result = await saleApi.updateQuantity(saleId, itemId, quantity);
        saleRef.current = result.sale;
        setSale(result.sale);
        if (result.warning) toast(result.warning, 'warn');
      },
      onQuantityError: (error) => toast(messageOf(error), 'danger'),
      onPendingChange: setPendingQty,
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

  function replaceSale(next: Sale | null) {
    queue.reset();
    saleRef.current = next;
    setSale(next);
  }

  return {
    sale,
    /** Quantidade exibida por item enquanto o servidor não confirma. */
    pendingQty,
    busy: adding || completing,
    completing,
    /** Abrindo a venda; sem venda e sem estar abrindo = a abertura falhou. */
    opening,

    /** Abre a venda em andamento do operador (ou retoma a que já existe). */
    async open() {
      setOpening(true);
      try {
        await perform(async () => replaceSale(await saleApi.open()));
      } finally {
        setOpening(false);
      }
    },

    /** Bipar: soma a quantidade se o produto já está na venda. */
    async addItem(input: AddSaleItemInput): Promise<AddItemResult> {
      setAdding(true);
      try {
        return await queue.run(async () => {
          const { sale: updated, itemId, warning } = await saleApi.addItem(current().id, input);
          current(updated);
          if (warning) toast(warning, 'warn');
          return { status: 'added' as const, itemId };
        });
      } catch (error) {
        // Código sem cadastro exato (EAN/SKU/id): o PDV cai na busca por nome.
        if (error instanceof ApiError && error.status === 404) return { status: 'not-found' };
        if (!(error instanceof PendingQuantityError)) toast(messageOf(error), 'danger');
        return { status: 'failed' };
      } finally {
        setAdding(false);
        onSettled();
      }
    },

    /** Alterar quantidade (sem motivo, sem rebipar). */
    setQuantity: (itemId: string, quantity: number) => queue.setQuantity(itemId, quantity),
    stepQuantity: (itemId: string, current: number, delta: number) =>
      queue.stepQuantity(itemId, current, delta),
    commitQuantities: () => queue.commitPending().finally(onSettled),

    /** Remover item: reversível, não mexe em estoque nem valores. */
    removeItem: (itemId: string) =>
      perform(async () => current(await saleApi.removeItem(current().id, itemId))),

    setDiscount: (discount: DiscountInput | null) =>
      perform(async () => current(await saleApi.setDiscount(current().id, discount))),

    /** Taxa de serviço: liga/desliga na própria Venda — o total já volta com ela. */
    setServiceFee: (enabled: boolean) =>
      perform(async () => current(await saleApi.setServiceFee(current().id, enabled))),

    /** Cancelar (venda em andamento): descarta e já abre a próxima. */
    cancel: () =>
      perform(async () => {
        await saleApi.cancel(current().id);
        replaceSale(null);
        replaceSale(await saleApi.open());
        return true;
      }),

    /**
     * Finaliza. `prepare` roda já com as quantidades confirmadas e decide o
     * pagamento a partir da venda atualizada (ou `null` para não finalizar).
     */
    complete: (prepare: (sale: Sale) => CompleteSaleBody | null) => {
      // Uma finalização por vez: F10/Enter repetidos não enfileiram outra.
      if (completingRef.current) return Promise.resolve(undefined);
      completingRef.current = true;
      return perform(async () => {
        const input = prepare(current());
        if (!input) return undefined;
        setCompleting(true);
        try {
          const completed = await saleApi.complete(current().id, input);
          replaceSale(null);
          await invalidateSettlement();
          return completed;
        } finally {
          setCompleting(false);
        }
      }).finally(() => {
        completingRef.current = false;
      });
    },
  };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro inesperado — tente novamente';
}
