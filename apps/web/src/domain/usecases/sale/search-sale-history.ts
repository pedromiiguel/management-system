import type { Paginated } from '@/domain/models/products';
import type { Sale } from '@/domain/models/sale';

/** FR-24: histórico de vendas (incl. canceladas) filtrado por período — permissão `sales.history`, distinta de `reports.read`. */
export interface ISearchSaleHistory {
  search: (from: string, to: string) => Promise<Paginated<Sale>>;
}
