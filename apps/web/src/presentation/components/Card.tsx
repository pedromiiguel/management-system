import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

export function Card({
  children,
  pad = 16,
  style,
  className,
}: {
  children: ReactNode;
  pad?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div className={clsx('s-card', className)} style={{ padding: pad, ...style }}>
      {children}
    </div>
  );
}
