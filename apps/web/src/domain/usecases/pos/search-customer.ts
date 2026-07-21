import type { Customer } from '@/domain/models/pos';

export interface ISearchCustomer {
  search: (query: string) => Promise<Customer[]>;
}
