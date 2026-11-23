import { queryOptions, useMutation } from '@tanstack/react-query';
import type { FinancialCategoryKind } from '@beverage/shared';
import { rootKeys, useInvalidate } from '@main/query/query-keys';
import type {
  IPeriod,
  TCashMovementParams,
  TCloseRegisterParams,
  TCreateCategoryParams,
  TCreatePayableParams,
  TManualEntryParams,
  TOpenRegisterParams,
  TSettleReceivableParams,
} from '../domain/financial-model';
import {
  makeCashRegisterGateway,
  makeFinancialGateway,
  makePayablesGateway,
  makeReceivablesGateway,
} from './financial-factory';

export const dashboardQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.financial, 'dashboard'],
    queryFn: () => makeFinancialGateway().getDashboard(),
  });

export const cashFlowQuery = (period: IPeriod) =>
  queryOptions({
    queryKey: [...rootKeys.financial, 'cash-flow', period.from, period.to],
    queryFn: () => makeFinancialGateway().getCashFlow(period),
  });

const categoriesQueryKey = [...rootKeys.financial, 'categories'];

export const categoriesQuery = () =>
  queryOptions({
    queryKey: categoriesQueryKey,
    queryFn: () => makeFinancialGateway().listCategories(),
  });

/** Categorias de um tipo (despesa ou receita), para os selects dos formulários. */
export const categoriesOfKindQuery = (kind: FinancialCategoryKind) =>
  queryOptions({
    ...categoriesQuery(),
    select: (categories) => categories.filter((category) => category.kind === kind),
  });

export const currentRegisterQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.cashRegister, 'current'],
    queryFn: () => makeCashRegisterGateway().getCurrent(),
  });

export const registerHistoryQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.cashRegister, 'history'],
    queryFn: () => makeCashRegisterGateway().getHistory(),
  });

export const receivablesQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.receivables],
    queryFn: () => makeReceivablesGateway().listOpen(),
  });

export const payablesQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.payables],
    queryFn: () => makePayablesGateway().listOpen(),
  });

export function useOpenRegister() {
  const onSuccess = useInvalidate('cashRegister', 'financial');
  return useMutation({
    mutationFn: (params: TOpenRegisterParams) => makeCashRegisterGateway().open(params),
    onSuccess,
  });
}

export function useCreateCashMovement() {
  const onSuccess = useInvalidate('cashRegister', 'financial');
  return useMutation({
    mutationFn: (params: TCashMovementParams) => makeCashRegisterGateway().createMovement(params),
    onSuccess,
  });
}

export function useCloseRegister() {
  const onSuccess = useInvalidate('cashRegister', 'financial');
  return useMutation({
    mutationFn: (params: TCloseRegisterParams) => makeCashRegisterGateway().close(params),
    onSuccess,
  });
}

export function useSettleReceivable() {
  const onSuccess = useInvalidate('receivables', 'cashRegister', 'financial', 'customers');
  return useMutation({
    mutationFn: (params: TSettleReceivableParams) => makeReceivablesGateway().settle(params),
    onSuccess,
  });
}

export function useCreatePayable() {
  const onSuccess = useInvalidate('payables');
  return useMutation({
    mutationFn: (params: TCreatePayableParams) => makePayablesGateway().create(params),
    onSuccess,
  });
}

export function usePayPayable() {
  const onSuccess = useInvalidate('payables', 'cashRegister', 'financial');
  return useMutation({
    mutationFn: (id: string) => makePayablesGateway().pay(id),
    onSuccess,
  });
}

export function useCreateManualEntry() {
  const onSuccess = useInvalidate('financial');
  return useMutation({
    mutationFn: (params: TManualEntryParams) => makeFinancialGateway().createManualEntry(params),
    onSuccess,
  });
}

export function useCreateCategory() {
  const onSuccess = useInvalidate('financial');
  return useMutation({
    mutationFn: (params: TCreateCategoryParams) => makeFinancialGateway().createCategory(params),
    onSuccess,
  });
}
