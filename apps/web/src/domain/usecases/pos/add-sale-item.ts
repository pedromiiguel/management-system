import type { AddSaleItemInput, Sale } from '@/domain/models/pos';

export interface IAddSaleItem {
  add: (saleId: string, input: AddSaleItemInput) => Promise<{ sale: Sale; warning: string | null }>;
}
