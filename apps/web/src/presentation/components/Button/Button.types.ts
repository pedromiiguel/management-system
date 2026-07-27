import type { LucideIcon } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

export type ButtonProps = {
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
};
