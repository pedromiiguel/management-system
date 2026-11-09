import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { MouseEvent } from 'react';

export function IconButton({
  icon: Icon,
  danger,
  title,
  onClick,
}: {
  icon: LucideIcon;
  danger?: boolean;
  title?: string;
  onClick?: (e: MouseEvent) => void;
}) {
  return (
    <button
      className={clsx('s-icon-btn', danger && 'is-danger')}
      title={title}
      aria-label={title}
      onClick={onClick}
      type="button"
    >
      <Icon size={15} />
    </button>
  );
}
