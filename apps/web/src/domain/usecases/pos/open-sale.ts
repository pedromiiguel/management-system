import type { Sale } from '@/domain/models/pos';

export interface IOpenSale {
  open: () => Promise<Sale>;
}
