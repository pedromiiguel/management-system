import type { AppSettings, SettingsInput } from '@beverage/shared';

export interface ISettingsGateway {
  get: () => Promise<AppSettings>;
  update: (params: SettingsInput) => Promise<AppSettings>;
}
