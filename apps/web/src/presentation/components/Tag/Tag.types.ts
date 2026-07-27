import type { ReactNode } from 'react';

export type TagProps = {
  children: ReactNode;
  tone?: 'ok' | 'warn' | 'dim' | 'accent' | 'danger';
};
