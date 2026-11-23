import type { TStockPositionRow } from '../../../domain/report-model';

export type TStockReportLayoutProps = {
  rows: TStockPositionRow[];
  totalCost: number;
  totalValue: number;
};
