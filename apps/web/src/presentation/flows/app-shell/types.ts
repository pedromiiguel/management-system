import type { LinkProps } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';

export type TNavItem = { icon: LucideIcon; label: string; to: LinkProps['to'] };

export type TAppShellLayoutProps = {
  userName: string | null;
  onLogoutClick: () => void;
};
