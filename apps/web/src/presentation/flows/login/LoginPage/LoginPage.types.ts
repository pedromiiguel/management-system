import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { LoginInput } from '@/domain/models/auth';

export type LoginPageViewProps = {
  register: UseFormRegister<LoginInput>;
  errors: FieldErrors<LoginInput>;
  onSubmit: () => void;
  submitting: boolean;
  loginError: string | null;
  passwordVisible: boolean;
  onTogglePasswordVisible: () => void;
};
