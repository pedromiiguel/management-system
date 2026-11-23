import type { ReactNode } from 'react';
import type { z } from 'zod';

export type TMoneyPromptProps = {
  title: string;
  label: string;
  submitLabel: string;
  width: number;
  /** Regra do shared para o valor (ex.: saldo de abertura ≥ 0). */
  rule: z.ZodType<number, number>;
  isPending: boolean;
  header?: ReactNode;
  /** Conteúdo abaixo do campo, enquanto o valor digitado é válido. */
  footer?: (value: number) => ReactNode;
  onSubmit: (value: number) => void;
  onClose: () => void;
};

export type TMoneyPromptLayoutProps = {
  title: string;
  label: string;
  submitLabel: string;
  width: number;
  raw: string;
  canSubmit: boolean;
  header?: ReactNode;
  footerContent: ReactNode;
  onRawChange: (raw: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};
