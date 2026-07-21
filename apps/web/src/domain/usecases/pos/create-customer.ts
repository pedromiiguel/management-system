import type { Customer } from '@/domain/models/pos';

export interface ICreateCustomer {
  create: (name: string) => Promise<Customer>;
}
