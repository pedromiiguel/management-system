import type { Product } from '@/domain/models/pos';

export interface ISearchProduct {
  search: (query: string, perPage: number) => Promise<{ items: Product[] }>;
}
