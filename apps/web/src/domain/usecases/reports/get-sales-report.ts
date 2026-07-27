import type { SalesReport } from '@/domain/models/reports';

export interface IGetSalesReport {
  get: (from: string, to: string) => Promise<SalesReport>;
}
