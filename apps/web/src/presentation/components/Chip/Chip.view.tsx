import { clsx } from 'clsx';
import type { ChipProps } from './Chip.types';

export function ChipView({ children, active, onClick }: ChipProps) {
  return (
    <button className={clsx('s-chip', active && 'is-active')} onClick={onClick} type="button">
      {children}
    </button>
  );
}
