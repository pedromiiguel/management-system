import { useQuery } from '@tanstack/react-query';
import { makeSearchRole, makeSearchUser } from '@/main/factories/handlers/users';

export function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => makeSearchUser().search(),
  });
}

export function useRolesQuery() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => makeSearchRole().search(),
  });
}
