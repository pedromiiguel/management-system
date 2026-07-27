import { useQuery } from '@tanstack/react-query';
import { makeGetSettings } from '@/main/factories/handlers/settings';

export function useSettingsQuery() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => makeGetSettings().get(),
  });
}
