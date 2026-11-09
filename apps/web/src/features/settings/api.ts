import { queryOptions, useMutation } from '@tanstack/react-query';
import type { AppSettings, SettingsInput } from '@beverage/shared';
import { http } from '@/lib/http';
import { rootKeys, useInvalidate } from '@/lib/query-keys';

export const settingsQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.settings],
    queryFn: () => http.get<AppSettings>('/settings'),
  });

/** A meta mensal aparece no painel financeiro; o prazo de validade, nos alertas de estoque. */
export function useUpdateSettings() {
  const onSuccess = useInvalidate('settings', 'financial', 'stock');
  return useMutation({
    mutationFn: (input: SettingsInput) => http.put<AppSettings>('/settings', input),
    onSuccess,
  });
}
