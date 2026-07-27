import type { AppSettings, SettingsInput } from '@/domain/models/settings';

export interface IUpdateSettings {
  update: (input: SettingsInput) => Promise<AppSettings>;
}
