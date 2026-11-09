import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={clsx('s-chip', active && 'is-active')} onClick={onClick} type="button">
      {children}
    </button>
  );
}
