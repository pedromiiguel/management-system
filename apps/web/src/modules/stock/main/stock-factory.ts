import { makeHttpClient } from '@main/factories/http/http-client-factory';
import { StockHandler } from '../data/stock-handler';
import type { IStockGateway } from '../domain/stock-gateway';

export const makeStockGateway = (): IStockGateway => new StockHandler(makeHttpClient());
