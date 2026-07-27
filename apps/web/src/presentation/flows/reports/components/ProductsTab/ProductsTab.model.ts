import { useProductPerformanceQuery } from '@/main/factories/queries/reports';

export function useProductsTabModel(from: string, to: string) {
  const { data: rows = [] } = useProductPerformanceQuery(from, to);
  return { rows };
}
