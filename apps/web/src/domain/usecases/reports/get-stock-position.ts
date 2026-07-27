import type { StockPositionRow } from '@/domain/models/reports';

export interface IGetStockPosition {
  get: () => Promise<StockPositionRow[]>;
}
