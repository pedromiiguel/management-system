import { makeHttpClient } from '@main/factories/http/http-client-factory';
import { SettingsHandler } from '../data/settings-handler';
import type { ISettingsGateway } from '../domain/settings-gateway';

export const makeSettingsGateway = (): ISettingsGateway => new SettingsHandler(makeHttpClient());
