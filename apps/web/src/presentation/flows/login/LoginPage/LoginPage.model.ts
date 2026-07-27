import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { loginSchema } from '@beverage/shared';
import type { LoginInput } from '@/domain/models/auth';
import { apiErrorMessage } from '@/lib/api';
import { setSession } from '@/lib/auth';
import { useLoginMutation } from '@/main/factories/mutations/auth';

// Só aceita destino relativo interno (começando com um único "/") — evita
// open redirect a partir do search param.
function safeRedirectTarget(target: string | undefined): string {
  if (target && target.startsWith('/') && !target.startsWith('//')) return target;
  return '/sale';
}

export function useLoginPageModel() {
  const navigate = useNavigate();
  const { redirect: redirectTo } = useSearch({ from: '/login' });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const login = useLoginMutation();

  const submit = handleSubmit((input) => {
    login.mutate(input, {
      onSuccess: (data) => {
        setSession(data.accessToken, data.user);
        void navigate({ href: safeRedirectTarget(redirectTo), replace: true });
      },
    });
  });

  return {
    register,
    errors,
    onSubmit: submit,
    submitting: login.isPending,
    loginError: login.isError ? apiErrorMessage(login.error) : null,
  };
}
