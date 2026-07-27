import type { IHttpClient } from '@/@contracts/http';
import type { AppSettings, SettingsInput } from '@/domain/models/settings';
import type { IUpdateSettings } from '@/domain/usecases/settings/update-settings';
import { settingsEndpoints } from '@/infra/endpoints/settings';

export class UpdateSettingsHandler implements IUpdateSettings {
  constructor(private readonly httpClient: IHttpClient) {}

  async update(input: SettingsInput): Promise<AppSettings> {
    const response = await this.httpClient.request<SettingsInput, AppSettings>({
      url: settingsEndpoints.settings(),
      method: 'PUT',
      body: input,
    });
    return response.body;
  }
}
