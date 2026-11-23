import { useQuery } from '@tanstack/react-query';
import { productPerformanceQuery } from '@modules/reports/main/reports-queries';
import { ProductsReportLayout } from './layout';
import type { TProductsReportFlowProps } from './types';
import { sortRows } from './utils';

export function ProductsReportController({
  period,
  sortByMargin = false,
}: TProductsReportFlowProps) {
  const { data = [] } = useQuery(productPerformanceQuery(period));
  return <ProductsReportLayout rows={sortRows(data, sortByMargin)} />;
}
