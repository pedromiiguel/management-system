import { GetSettingsHandler } from '@/data/handlers/settings/get-settings-handler';
import { UpdateSettingsHandler } from '@/data/handlers/settings/update-settings-handler';
import { httpClient } from '@/main/factories/http/make-http-client';

export const makeGetSettings = () => new GetSettingsHandler(httpClient);
export const makeUpdateSettings = () => new UpdateSettingsHandler(httpClient);
