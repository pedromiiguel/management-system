import { makeHttpClient } from '@main/factories/http/http-client-factory';
import { CustomersHandler, SaleHandler } from '../data/sale-handlers';
import type { ICustomersGateway } from '../domain/customers-gateway';
import type { ISaleGateway } from '../domain/sale-gateway';

export const makeSaleGateway = (): ISaleGateway => new SaleHandler(makeHttpClient());

export const makeCustomersGateway = (): ICustomersGateway => new CustomersHandler(makeHttpClient());
