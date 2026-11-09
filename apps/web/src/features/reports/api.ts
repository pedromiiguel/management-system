import { queryOptions } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { rootKeys } from '@/lib/query-keys';
import type { Product } from '@/features/products/api';

/** Receita (CONTEXT.md): só produtos, sem a Taxa de serviço — a taxa vem à parte. */
interface SalesTotals {
  count: number;
  revenue: number;
  serviceFee: number;
}

export interface SalesReport extends SalesTotals {
  days: (SalesTotals & { day: string })[];
  /** Vendas estornadas no período. */
  voidedCount: number;
}

export interface ProductPerformance {
  product: Pick<Product, 'id' | 'name' | 'sku' | 'unit'> | null;
  quantity: number;
  /** Preço × quantidade, antes do desconto da venda — não é Receita. */
  grossSales: number;
  cost: number;
  margin: number;
  marginPercent: number;
}

export type StockPositionRow = Pick<
  Product,
  'id' | 'sku' | 'name' | 'unit' | 'currentStock' | 'minimumStock'
> & {
  /** Abaixo do mínimo (FR-07) — a regra é da API. */
  low: boolean;
  stockCost: number;
  stockValue: number;
};

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
