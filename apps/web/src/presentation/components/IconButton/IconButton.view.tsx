import { clsx } from 'clsx';
import type { IconButtonProps } from './IconButton.types';

export function IconButtonView({ icon: Icon, danger, title, onClick }: IconButtonProps) {
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
