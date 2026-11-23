import { makeHttpClient } from '@main/factories/http/http-client-factory';
import {
  CashRegisterHandler,
  FinancialHandler,
  PayablesHandler,
  ReceivablesHandler,
} from '../data/financial-handlers';
import type {
  ICashRegisterGateway,
  IFinancialGateway,
  IPayablesGateway,
  IReceivablesGateway,
} from '../domain/financial-gateways';

export const makeFinancialGateway = (): IFinancialGateway => new FinancialHandler(makeHttpClient());
export const makeCashRegisterGateway = (): ICashRegisterGateway =>
  new CashRegisterHandler(makeHttpClient());
export const makeReceivablesGateway = (): IReceivablesGateway =>
  new ReceivablesHandler(makeHttpClient());
export const makePayablesGateway = (): IPayablesGateway => new PayablesHandler(makeHttpClient());
