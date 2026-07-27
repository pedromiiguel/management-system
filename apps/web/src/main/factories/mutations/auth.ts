import { useMutation } from '@tanstack/react-query';
import type { LoginInput } from '@/domain/models/auth';
import { makeLogin } from '@/main/factories/handlers/auth';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (input: LoginInput) => makeLogin().login(input),
  });
}
