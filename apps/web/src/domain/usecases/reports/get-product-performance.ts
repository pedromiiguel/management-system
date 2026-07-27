import type { ProductPerformance } from '@/domain/models/reports';

export interface IGetProductPerformance {
  get: (from: string, to: string) => Promise<ProductPerformance[]>;
}
