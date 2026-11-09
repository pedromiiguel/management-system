import { queryOptions } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { rootKeys } from '@/lib/query-keys';
import type { Product } from '@/features/products/api';

export interface SalesReport {
  days: { day: string; count: number; total: number }[];
  count: number;
  /** Receita só de produtos, sem a Taxa de serviço (ADR 0002). */
  total: number;
  serviceFeeTotal: number;
}

export interface ProductPerformance {
  product: Pick<Product, 'id' | 'name' | 'sku' | 'unit'> | null;
  quantity: number;
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number;
}

export type StockPositionRow = Pick<
  Product,
  'id' | 'sku' | 'name' | 'unit' | 'currentStock' | 'minimumStock'
> & { stockCost: number; stockValue: number };

export const salesReportQuery = (from: string, to: string) =>
  queryOptions({
    queryKey: [...rootKeys.reports, 'sales', from, to],
    queryFn: () => http.get<SalesReport>('/reports/sales', { from, to }),
  });

export const productPerformanceQuery = (from: string, to: string) =>
  queryOptions({
    queryKey: [...rootKeys.reports, 'products', from, to],
    queryFn: () => http.get<ProductPerformance[]>('/reports/products', { from, to }),
  });

export const stockPositionQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.reports, 'stock-position'],
    queryFn: () => http.get<StockPositionRow[]>('/reports/stock-position'),
  });

/** Mesmo recorte das telas, em CSV. */
export const reportCsv = {
  sales: (from: string, to: string) => http.blob('/reports/sales', { from, to, format: 'csv' }),
  products: (from: string, to: string) =>
    http.blob('/reports/products', { from, to, format: 'csv' }),
  stock: () => http.blob('/reports/stock-position', { format: 'csv' }),
};
