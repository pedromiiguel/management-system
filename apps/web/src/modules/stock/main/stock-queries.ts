import { queryOptions, useMutation } from '@tanstack/react-query';
import { rootKeys, useInvalidate } from '@main/query/query-keys';
import type { TStockAdjustmentParams, TStockEntryParams } from '../domain/stock-model';
import { makeStockGateway } from './stock-factory';

export const stockAlertsQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.stock, 'alerts'],
    queryFn: () => makeStockGateway().getAlerts(),
  });

export const stockMovementsQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.stock, 'movements'],
    queryFn: () => makeStockGateway().getMovements(),
  });

const STOCK_EFFECTS = ['stock', 'products', 'reports'] as const;

export function useCreateStockEntry() {
  const onSuccess = useInvalidate(...STOCK_EFFECTS);
  return useMutation({
    mutationFn: (params: TStockEntryParams) => makeStockGateway().registerEntry(params),
    onSuccess,
  });
}

export function useCreateStockAdjustment() {
  const onSuccess = useInvalidate(...STOCK_EFFECTS);
  return useMutation({
    mutationFn: (params: TStockAdjustmentParams) => makeStockGateway().registerAdjustment(params),
    onSuccess,
  });
}
