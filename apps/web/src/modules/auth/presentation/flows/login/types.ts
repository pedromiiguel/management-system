import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { LoginInput } from '@beverage/shared';

export type TLoginLayoutProps = {
  register: UseFormRegister<LoginInput>;
  fieldErrors: FieldErrors<LoginInput>;
  submitError: string | null;
  isSubmitting: boolean;
  isPasswordVisible: boolean;
  onTogglePasswordClick: () => void;
  onSubmit: () => void;
};
