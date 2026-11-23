import type { z } from 'zod';
import type { addSaleItemSchema, DiscountType, PaymentMethod, SaleStatus } from '@beverage/shared';
import type { IProduct } from '@modules/products/domain/product-model';

export interface ICustomer {
  id: string;
  name: string;
  contact: string | null;
  active: boolean;
  openBalance: number;
}

export interface ISaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  product: Pick<IProduct, 'name' | 'sku' | 'ean' | 'unit'>;
}

export interface ISale {
  id: string;
  status: SaleStatus;
  subtotal: number;
  /** Valor devido — já inclui a Taxa de serviço quando ligada. */
  total: number;
  discountType: DiscountType | null;
  discountValue: number | null;
  paymentMethod: PaymentMethod | null;
  amountPaid: number | null;
  change: number | null;
  /** Taxa de serviço; null = desligada. */
  serviceFee: number | null;
  withInvoice: boolean;
  openedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  voidedAt: string | null;
  items: ISaleItem[];
  customer: Pick<ICustomer, 'id' | 'name'> | null;
  operator: { id: string; name: string };
}

export type TAddSaleItemInput = z.input<typeof addSaleItemSchema>;
export type TSaleItemResult = { sale: ISale; warning: string | null };
/** Bipar devolve também o item bipado (criado ou somado). */
export type TAddSaleItemResult = TSaleItemResult & { itemId: string };
