import type { CustomerInput } from '@beverage/shared';
import type { ICustomer } from './sale-model';

/** Clientes do fiado, escolhidos ou cadastrados no PDV. */
export interface ICustomersGateway {
  search: (search: string) => Promise<ICustomer[]>;
  create: (input: CustomerInput) => Promise<ICustomer>;
}
