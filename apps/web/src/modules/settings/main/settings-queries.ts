import { queryOptions, useMutation } from '@tanstack/react-query';
import type { SettingsInput } from '@beverage/shared';
import { rootKeys, useInvalidate } from '@main/query/query-keys';
import { makeSettingsGateway } from './settings-factory';

export const settingsQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.settings],
    queryFn: () => makeSettingsGateway().get(),
  });

/** A meta mensal aparece no painel financeiro; o prazo de validade, nos alertas de estoque. */
export function useUpdateSettings() {
  const onSuccess = useInvalidate('settings', 'financial', 'stock');
  return useMutation({
    mutationFn: (params: SettingsInput) => makeSettingsGateway().update(params),
    onSuccess,
  });
}
