import type { CompleteSaleBody, DiscountInput } from '@beverage/shared';
import type { IPaginated } from '@domain/models/paginated-model';
import type { IPeriod } from '@domain/models/period-model';
import type { ISale, TAddSaleItemInput, TAddSaleItemResult, TSaleItemResult } from './sale-model';

/** Venda em andamento (só o `useSaleFlow` chama, em fila) e o histórico. */
export interface ISaleGateway {
  /** Abre a venda em andamento do operador ou retoma a que já existe. */
  open: () => Promise<ISale>;
  /** Bipar: soma a quantidade se o produto já está na venda. */
  addItem: (saleId: string, input: TAddSaleItemInput) => Promise<TAddSaleItemResult>;
  updateQuantity: (saleId: string, itemId: string, quantity: number) => Promise<TSaleItemResult>;
  removeItem: (saleId: string, itemId: string) => Promise<ISale>;
  setDiscount: (saleId: string, discount: DiscountInput | null) => Promise<ISale>;
  setServiceFee: (saleId: string, enabled: boolean) => Promise<ISale>;
  cancel: (saleId: string) => Promise<void>;
  complete: (saleId: string, input: CompleteSaleBody) => Promise<ISale>;
  getHistory: (period: IPeriod, page: number) => Promise<IPaginated<ISale>>;
  /** Estornar: desfaz uma venda concluída, devolvendo estoque e valores. */
  void: (saleId: string) => Promise<void>;
}
