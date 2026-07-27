import type { AppSettings } from '@/domain/models/settings';

export interface IGetSettings {
  get: () => Promise<AppSettings>;
}
