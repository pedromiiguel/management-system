import { makeHttpClient } from '@main/factories/http/http-client-factory';
import { ProductsHandler } from '../data/products-handler';
import type { IProductsGateway } from '../domain/products-gateway';

export const makeProductsGateway = (): IProductsGateway => new ProductsHandler(makeHttpClient());
