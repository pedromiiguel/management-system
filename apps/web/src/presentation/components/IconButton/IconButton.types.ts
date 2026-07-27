import type { LucideIcon } from 'lucide-react';
import type { MouseEvent } from 'react';

export type IconButtonProps = {
  icon: LucideIcon;
  danger?: boolean;
  title?: string;
  onClick?: (e: MouseEvent) => void;
};
