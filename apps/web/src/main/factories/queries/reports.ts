import { useQuery } from '@tanstack/react-query';
import {
  makeGetProductPerformance,
  makeGetSalesReport,
  makeGetStockPosition,
} from '@/main/factories/handlers/reports';

export function useSalesReportQuery(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'sales', from, to],
    queryFn: () => makeGetSalesReport().get(from, to),
  });
}

export function useProductPerformanceQuery(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'products', from, to],
    queryFn: () => makeGetProductPerformance().get(from, to),
  });
}

export function useStockPositionQuery() {
  return useQuery({
    queryKey: ['reports', 'stock-position'],
    queryFn: () => makeGetStockPosition().get(),
  });
}
