import { queryOptions, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import type {
  addSaleItemSchema,
  CompleteSaleBody,
  CustomerInput,
  DiscountInput,
  DiscountType,
  PaymentMethod,
  SaleStatus,
} from '@beverage/shared';
import { http, type Paginated } from '@/lib/http';
import { rootKeys, useInvalidate, type Resource } from '@/lib/query-keys';
import type { Product } from '@/features/products/api';

export interface Customer {
  id: string;
  name: string;
  contact: string | null;
  active: boolean;
  openBalance: number;
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  product: Pick<Product, 'name' | 'sku' | 'ean' | 'unit'>;
}

export interface Sale {
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
  items: SaleItem[];
  customer: Pick<Customer, 'id' | 'name'> | null;
  operator: { id: string; name: string };
}

export type AddSaleItemInput = z.input<typeof addSaleItemSchema>;
export type SaleItemResult = { sale: Sale; warning: string | null };
/** Bipar devolve também o item bipado (criado ou somado). */
export type AddSaleItemResult = SaleItemResult & { itemId: string };

/** Operações da venda em andamento — só o `useSaleFlow` chama, em fila. */
export const saleApi = {
  open: () => http.post<Sale>('/sales'),
  addItem: (saleId: string, input: AddSaleItemInput) =>
    http.post<AddSaleItemResult>(`/sales/${saleId}/items`, input),
  updateQuantity: (saleId: string, itemId: string, quantity: number) =>
    http.patch<SaleItemResult>(`/sales/${saleId}/items/${itemId}`, { quantity }),
  removeItem: (saleId: string, itemId: string) =>
    http.delete<Sale>(`/sales/${saleId}/items/${itemId}`),
  setDiscount: (saleId: string, discount: DiscountInput | null) =>
    http.put<Sale>(`/sales/${saleId}/discount`, discount),
  setServiceFee: (saleId: string, enabled: boolean) =>
    http.put<Sale>(`/sales/${saleId}/service-fee`, { enabled }),
  cancel: (saleId: string) => http.post<unknown>(`/sales/${saleId}/cancel`),
  complete: (saleId: string, input: CompleteSaleBody) =>
    http.post<Sale>(`/sales/${saleId}/complete`, input),
};

/**
 * Tudo o que concluir ou estornar uma venda mexe no servidor: estoque,
 * caixa, fluxo financeiro, relatórios e o saldo devedor do cliente (fiado).
 */
export const SALE_SETTLEMENT_EFFECTS: Resource[] = [
  'sales',
  'products',
  'stock',
  'cashRegister',
  'financial',
  'reports',
  'customers',
  'receivables',
];

export const salesHistoryQuery = (from: string, to: string, page: number) =>
  queryOptions({
    queryKey: [...rootKeys.sales, 'history', from, to, page],
    queryFn: () => http.get<Paginated<Sale>>('/sales/history', { from, to, page }),
  });

/** Estornar: cancela uma venda concluída, devolvendo estoque e valores. */
export function useVoidSale() {
  const onSuccess = useInvalidate(...SALE_SETTLEMENT_EFFECTS);
  return useMutation({
    mutationFn: (saleId: string) => http.post<unknown>(`/sales/${saleId}/void`),
    onSuccess,
  });
}

export const customerSearchQuery = (search: string) =>
  queryOptions({
    queryKey: [...rootKeys.customers, search],
    queryFn: () => http.get<Customer[]>('/customers', { search }),
  });

export function useCreateCustomer() {
  const onSuccess = useInvalidate('customers');
  return useMutation({
    mutationFn: (input: CustomerInput) => http.post<Customer>('/customers', input),
    onSuccess,
  });
}
