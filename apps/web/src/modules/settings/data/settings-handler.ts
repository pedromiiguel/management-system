import type { AppSettings, SettingsInput } from '@beverage/shared';
import { HttpMethod } from '@shared/http';
import { BaseService } from '@data/base-service/base-service';
import type { ISettingsGateway } from '../domain/settings-gateway';

const SETTINGS_URL = '/settings';

export class SettingsHandler extends BaseService implements ISettingsGateway {
  get() {
    return this.send<AppSettings>({ url: SETTINGS_URL, method: HttpMethod.GET });
  }

  update(params: SettingsInput) {
    return this.send<AppSettings>({ url: SETTINGS_URL, method: HttpMethod.PUT, body: params });
  }
}
