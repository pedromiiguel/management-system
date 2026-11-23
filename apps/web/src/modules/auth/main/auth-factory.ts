import { makeHttpClient } from '@main/factories/http/http-client-factory';
import { AuthHandler } from '../data/auth-handler';
import type { IAuthGateway } from '../domain/auth-gateway';

export const makeAuthGateway = (): IAuthGateway => new AuthHandler(makeHttpClient());
