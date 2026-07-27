import type { ReactNode } from 'react';

export type ToastTone = 'info' | 'warn' | 'danger';

export type ToastState = {
  message: string;
  tone: ToastTone;
};

export type ToastProviderProps = {
  children: ReactNode;
};

export type ToastViewProps = {
  children: ReactNode;
  toast: ToastState | null;
};
