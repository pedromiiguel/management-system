import { queryOptions, useMutation } from '@tanstack/react-query';
import type {
  StockAdjustmentInput,
  StockEntryInput,
  StockMovementSource,
  StockMovementType,
} from '@beverage/shared';
import { http } from '@/lib/http';
import { rootKeys, useInvalidate } from '@/lib/query-keys';
import type { Product } from '@/features/products/api';

export interface StockAlerts {
  lowStock: Pick<Product, 'id' | 'name' | 'sku' | 'currentStock' | 'minimumStock'>[];
  expiring: {
    id: string;
    batch: string | null;
    expiresAt: string | null;
    quantity: number;
    product: Pick<Product, 'id' | 'name' | 'sku'>;
  }[];
}

export interface StockMovement {
  id: string;
  type: StockMovementType;
  source: StockMovementSource;
  quantity: number;
  note: string | null;
  createdAt: string;
  product: Pick<Product, 'name' | 'sku' | 'unit'>;
}

export const stockAlertsQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.stock, 'alerts'],
    queryFn: () => http.get<StockAlerts>('/stock/alerts'),
  });

export const stockMovementsQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.stock, 'movements'],
    queryFn: () => http.get<StockMovement[]>('/stock/movements'),
  });

const STOCK_EFFECTS = ['stock', 'products', 'reports'] as const;

/** Entrada: soma ao saldo, nunca sobrescreve. */
export function useCreateStockEntry() {
  const onSuccess = useInvalidate(...STOCK_EFFECTS);
  return useMutation({
    mutationFn: (input: StockEntryInput) =>
      http.post<{ currentStock: number }>('/stock/entries', input),
    onSuccess,
  });
}

/** Ajustar: correção auditada do saldo, com motivo obrigatório. */
export function useCreateStockAdjustment() {
  const onSuccess = useInvalidate(...STOCK_EFFECTS);
  return useMutation({
    mutationFn: (input: StockAdjustmentInput) =>
      http.post<{ id: string; type: StockMovementType; quantity: number }>(
        '/stock/adjustments',
        input,
      ),
    onSuccess,
  });
}
