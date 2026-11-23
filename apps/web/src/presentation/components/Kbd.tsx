import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export function Kbd({ children, light }: { children: ReactNode; light?: boolean }) {
  return <span className={clsx('s-kbd', light && 'is-light')}>{children}</span>;
}
