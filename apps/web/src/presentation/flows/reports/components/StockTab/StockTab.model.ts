import { useStockPositionQuery } from '@/main/factories/queries/reports';

export function useStockTabModel() {
  const { data: rows = [] } = useStockPositionQuery();
  return { rows };
}
