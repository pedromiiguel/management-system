import { queryOptions, useMutation } from '@tanstack/react-query';
import type { CustomerInput } from '@beverage/shared';
import type { IPeriod } from '@domain/models/period-model';
import { rootKeys, useInvalidate, type Resource } from '@main/query/query-keys';
import { makeCustomersGateway, makeSaleGateway } from './sale-factory';

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

export const salesHistoryQuery = (period: IPeriod, page: number) =>
  queryOptions({
    queryKey: [...rootKeys.sales, 'history', period.from, period.to, page],
    queryFn: () => makeSaleGateway().getHistory(period, page),
  });

/** Estornar: desfaz uma venda concluída (VOIDED), devolvendo estoque e valores. */
export function useVoidSale() {
  const onSuccess = useInvalidate(...SALE_SETTLEMENT_EFFECTS);
  return useMutation({
    mutationFn: (saleId: string) => makeSaleGateway().void(saleId),
    onSuccess,
  });
}

export const customerSearchQuery = (search: string) =>
  queryOptions({
    queryKey: [...rootKeys.customers, search],
    queryFn: () => makeCustomersGateway().search(search),
  });

export function useCreateCustomer() {
  const onSuccess = useInvalidate('customers');
  return useMutation({
    mutationFn: (input: CustomerInput) => makeCustomersGateway().create(input),
    onSuccess,
  });
}
