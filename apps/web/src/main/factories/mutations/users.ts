import { useMutation } from '@tanstack/react-query';
import type { CreateUserInput, RoleInput, UpdateUserInput } from '@/domain/models/users';
import { makeCreateRole, makeCreateUser, makeUpdateRole, makeUpdateUser } from '@/main/factories/handlers/users';

export function useCreateUserMutation() {
  return useMutation({
    mutationFn: (input: CreateUserInput) => makeCreateUser().create(input),
  });
}

export function useUpdateUserMutation() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => makeUpdateUser().update(id, input),
  });
}

export function useCreateRoleMutation() {
  return useMutation({
    mutationFn: (input: RoleInput) => makeCreateRole().create(input),
  });
}

export function useUpdateRoleMutation() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RoleInput }) => makeUpdateRole().update(id, input),
  });
}
