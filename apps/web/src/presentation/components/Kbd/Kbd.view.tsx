import { clsx } from 'clsx';
import type { KbdProps } from './Kbd.types';

export function KbdView({ children, light }: KbdProps) {
  return <span className={clsx('s-kbd', light && 'is-light')}>{children}</span>;
}
