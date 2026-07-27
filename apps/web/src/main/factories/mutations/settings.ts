import { useMutation } from '@tanstack/react-query';
import type { SettingsInput } from '@/domain/models/settings';
import { makeUpdateSettings } from '@/main/factories/handlers/settings';

export function useUpdateSettingsMutation() {
  return useMutation({
    mutationFn: (input: SettingsInput) => makeUpdateSettings().update(input),
  });
}
