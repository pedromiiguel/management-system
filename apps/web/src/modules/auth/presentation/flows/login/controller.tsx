import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginInput } from '@beverage/shared';
import { useLogin } from '@modules/auth/main/auth-queries';
import { LoginLayout } from './layout';
import { safeRedirectTarget } from './utils';

export function LoginController() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: '/login' });
  const [isPasswordVisibleState, setIsPasswordVisibleState] = useState(false);
  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  const login = useLogin();

  const handleLogin = (params: LoginInput) =>
    login.mutate(params, {
      onSuccess: () => navigate({ href: safeRedirectTarget(redirect), replace: true }),
    });

  return (
    <LoginLayout
      register={register}
      fieldErrors={formState.errors}
      submitError={login.error?.message ?? null}
      isSubmitting={login.isPending}
      isPasswordVisible={isPasswordVisibleState}
      onTogglePasswordClick={() => setIsPasswordVisibleState((visible) => !visible)}
      onSubmit={handleSubmit(handleLogin)}
    />
  );
}
