import type { ReactNode } from 'react';

export function Tag({
  children,
  tone = 'ok',
}: {
  children: ReactNode;
  tone?: 'ok' | 'warn' | 'dim' | 'accent' | 'danger';
}) {
  return <span className={`s-tag is-${tone}`}>{children}</span>;
}
