import type { DiscountInput, Sale } from '@/domain/models/pos';

export interface ISetSaleDiscount {
  set: (saleId: string, discount: DiscountInput | null) => Promise<Sale>;
}
