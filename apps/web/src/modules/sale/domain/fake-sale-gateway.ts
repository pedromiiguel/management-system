import { SaleStatus, type CompleteSaleBody, type DiscountInput } from '@beverage/shared';
import { NotFoundError } from '@domain/errors';
import { makeItem, makeSale } from './fixtures';
import type { ISale, TAddSaleItemInput } from './sale-model';
import { salePricing } from './sale-pricing';
import type { TSaleSessionGateway } from './sale-session';

/**
 * Venda em andamento em memória, para testar a sessão do PDV sem HTTP. O
 * Total é recalculado pelo `priceSale` do shared, como no servidor. Produtos
 * conhecidos: os de `catalog` (código → preço); outro código dá NotFoundError.
 */
export class FakeSaleGateway implements TSaleSessionGateway {
  sale: ISale | null = null;
  /** Corpo de cada conclusão recebida. */
  completed: CompleteSaleBody[] = [];
  /** Próxima chamada de `updateQuantity` falha com este erro. */
  failNextQuantity: Error | null = null;
  private nextId = 1;
  private opened = 0;

  constructor(private readonly catalog: Record<string, number> = { '789': 10 }) {}

  async open() {
    if (!this.sale) {
      this.opened += 1;
      this.sale = this.reprice(
        makeSale({
          id: `sale-${this.opened}`,
          status: SaleStatus.IN_PROGRESS,
          completedAt: null,
        }),
      );
    }
    return this.sale;
  }

  async addItem(saleId: string, input: TAddSaleItemInput) {
    const sale = this.get(saleId);
    const unitPrice = this.catalog[input.code];
    if (unitPrice === undefined) throw new NotFoundError(404, 'Produto não encontrado');
    const quantity = input.quantity ?? 1;
    const existing = sale.items.find((item) => item.productId === input.code);
    const itemId = existing?.id ?? `item-${this.nextId++}`;
    const items = existing
      ? sale.items.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item,
        )
      : [...sale.items, makeItem({ id: itemId, productId: input.code, unitPrice, quantity })];
    return { sale: this.save({ ...sale, items }), itemId, warning: null };
  }

  async updateQuantity(saleId: string, itemId: string, quantity: number) {
    if (this.failNextQuantity) {
      const error = this.failNextQuantity;
      this.failNextQuantity = null;
      throw error;
    }
    const sale = this.get(saleId);
    const items = sale.items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
    return { sale: this.save({ ...sale, items }), warning: null };
  }

  async removeItem(saleId: string, itemId: string) {
    const sale = this.get(saleId);
    return this.save({ ...sale, items: sale.items.filter((item) => item.id !== itemId) });
  }

  async setDiscount(saleId: string, discount: DiscountInput | null) {
    const sale = this.get(saleId);
    return this.save({
      ...sale,
      discountType: discount?.type ?? null,
      discountValue: discount?.value ?? null,
    });
  }

  async setServiceFee(saleId: string, enabled: boolean) {
    return this.save({ ...this.get(saleId), serviceFee: enabled ? 0 : null });
  }

  async cancel(saleId: string) {
    this.get(saleId);
    this.sale = null;
  }

  async complete(saleId: string, input: CompleteSaleBody) {
    const sale = this.get(saleId);
    this.completed.push(input);
    this.sale = null;
    return { ...sale, status: SaleStatus.COMPLETED, paymentMethod: input.paymentMethod };
  }

  private get(saleId: string): ISale {
    if (!this.sale || this.sale.id !== saleId) throw new NotFoundError(404, 'Venda não encontrada');
    return this.sale;
  }

  private save(sale: ISale): ISale {
    this.sale = this.reprice(sale);
    return this.sale;
  }

  private reprice(sale: ISale): ISale {
    const pricing = salePricing(sale);
    return {
      ...sale,
      subtotal: pricing.subtotal,
      total: pricing.total,
      serviceFee: pricing.serviceFee,
    };
  }
}
