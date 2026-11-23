import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Kbd } from './Kbd';

export function Button({
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
}: {
  children: ReactNode;
  primary?: boolean;
  ghost?: boolean;
  danger?: boolean;
  big?: boolean;
  kbd?: string;
  icon?: LucideIcon;
  style?: CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      className={clsx(
        's-btn',
        primary && 'is-primary',
        ghost && 'is-ghost',
        danger && 'is-danger',
        big && 'is-big',
      )}
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
