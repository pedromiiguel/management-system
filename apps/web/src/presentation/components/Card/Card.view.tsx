import { clsx } from 'clsx';
import type { CardProps } from './Card.types';

export function CardView({ children, pad = 16, style, className }: CardProps) {
  return (
    <div className={clsx('s-card', className)} style={{ padding: pad, ...style }}>
      {children}
    </div>
  );
}
