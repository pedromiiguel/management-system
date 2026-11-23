import { useQuery } from '@tanstack/react-query';
import { stockPositionQuery } from '@modules/reports/main/reports-queries';
import { StockReportLayout } from './layout';

export function StockReportController() {
  const { data: rows = [] } = useQuery(stockPositionQuery());
  return (
    <StockReportLayout
      rows={rows}
      totalCost={rows.reduce((sum, row) => sum + row.stockCost, 0)}
      totalValue={rows.reduce((sum, row) => sum + row.stockValue, 0)}
    />
  );
}
