import type { IHttpClient } from '@/@contracts/http';
import type { AppSettings } from '@/domain/models/settings';
import type { IGetSettings } from '@/domain/usecases/settings/get-settings';
import { settingsEndpoints } from '@/infra/endpoints/settings';

export class GetSettingsHandler implements IGetSettings {
  constructor(private readonly httpClient: IHttpClient) {}

  async get(): Promise<AppSettings> {
    const response = await this.httpClient.request<undefined, AppSettings>({
      url: settingsEndpoints.settings(),
      method: 'GET',
    });
    return response.body;
  }
}
