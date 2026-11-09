import { queryOptions, useMutation } from '@tanstack/react-query';
import type { CreateUserInput, Permission, RoleInput } from '@beverage/shared';
import { http } from '@/lib/http';
import { rootKeys, useInvalidate } from '@/lib/query-keys';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  system: boolean;
}

export interface User {
  id: string;
  name: string;
  login: string;
  active: boolean;
  roleId: string;
  role: Pick<Role, 'id' | 'name'>;
}

export const usersQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.users],
    queryFn: () => http.get<User[]>('/users'),
  });

export const rolesQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.roles],
    queryFn: () => http.get<Role[]>('/users/roles/all'),
  });

export function useCreateUser() {
  const onSuccess = useInvalidate('users');
  return useMutation({
    mutationFn: (input: CreateUserInput) => http.post<User>('/users', input),
    onSuccess,
  });
}

export function useCreateRole() {
  const onSuccess = useInvalidate('roles');
  return useMutation({
    mutationFn: (input: RoleInput) => http.post<Role>('/users/roles', input),
    onSuccess,
  });
}

/** O nome do papel aparece na lista de usuários. */
export function useUpdateRole() {
  const onSuccess = useInvalidate('roles', 'users');
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoleInput }) =>
      http.patch<Role>(`/users/roles/${id}`, input),
    onSuccess,
  });
}
