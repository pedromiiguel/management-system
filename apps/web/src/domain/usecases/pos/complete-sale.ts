import type { CompleteSaleInput, Sale } from '@/domain/models/pos';

export interface ICompleteSale {
  complete: (saleId: string, input: CompleteSaleInput) => Promise<Sale>;
}
