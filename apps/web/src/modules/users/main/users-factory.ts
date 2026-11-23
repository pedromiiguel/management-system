import { makeHttpClient } from '@main/factories/http/http-client-factory';
import { UsersHandler } from '../data/users-handler';
import type { IUsersGateway } from '../domain/users-gateway';

export const makeUsersGateway = (): IUsersGateway => new UsersHandler(makeHttpClient());
