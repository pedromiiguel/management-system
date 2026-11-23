import type { IPeriod } from '@domain/models/period-model';
import type {
  IProductPerformance,
  ISalesReport,
  TReportKind,
  TStockPositionRow,
} from './report-model';

export interface IReportsGateway {
  getSales: (period: IPeriod) => Promise<ISalesReport>;
  getProductPerformance: (period: IPeriod) => Promise<IProductPerformance[]>;
  getStockPosition: () => Promise<TStockPositionRow[]>;
  /** A posição de estoque ignora o período. */
  exportCsv: (kind: TReportKind, period: IPeriod) => Promise<Blob>;
}
