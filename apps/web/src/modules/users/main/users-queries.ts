import { queryOptions, useMutation } from '@tanstack/react-query';
import { rootKeys, useInvalidate } from '@main/query/query-keys';
import type { TCreateRoleParams, TCreateUserParams, TUpdateRoleParams } from '../domain/user-model';
import { makeUsersGateway } from './users-factory';

export const usersQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.users],
    queryFn: () => makeUsersGateway().listUsers(),
  });

export const rolesQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.roles],
    queryFn: () => makeUsersGateway().listRoles(),
  });

export function useCreateUser() {
  const onSuccess = useInvalidate('users');
  return useMutation({
    mutationFn: (params: TCreateUserParams) => makeUsersGateway().createUser(params),
    onSuccess,
  });
}

export function useCreateRole() {
  const onSuccess = useInvalidate('roles');
  return useMutation({
    mutationFn: (params: TCreateRoleParams) => makeUsersGateway().createRole(params),
    onSuccess,
  });
}

/** O nome do papel aparece na lista de usuários; o papel pode ser o do próprio usuário logado. */
export function useUpdateRole() {
  const onSuccess = useInvalidate('roles', 'users', 'session');
  return useMutation({
    mutationFn: (params: TUpdateRoleParams) => makeUsersGateway().updateRole(params),
    onSuccess,
  });
}
