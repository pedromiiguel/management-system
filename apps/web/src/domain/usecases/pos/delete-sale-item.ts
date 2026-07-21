import type { Sale } from '@/domain/models/pos';

export interface IDeleteSaleItem {
  delete: (saleId: string, itemId: string) => Promise<Sale>;
}
