import { clsx } from 'clsx';
import { Kbd } from '@/presentation/components/Kbd';
import type { ButtonProps } from './Button.types';

export function ButtonView({
  children,
  primary,
  ghost,
  danger,
  big,
  kbd,
  icon: Icon,
  style,
  onClick,
  disabled,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      className={clsx('s-btn', primary && 'is-primary', ghost && 'is-ghost', danger && 'is-danger', big && 'is-big')}
      style={style}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {Icon ? <Icon size={15} /> : null}
      <span>{children}</span>
      {kbd ? <Kbd light={primary}>{kbd}</Kbd> : null}
    </button>
  );
}
