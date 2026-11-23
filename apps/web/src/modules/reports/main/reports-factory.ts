import { makeHttpClient } from '@main/factories/http/http-client-factory';
import { ReportsHandler } from '../data/reports-handler';
import type { IReportsGateway } from '../domain/reports-gateway';

export const makeReportsGateway = (): IReportsGateway => new ReportsHandler(makeHttpClient());
