import type { ReactNode } from 'react';

export type ChipProps = {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
};
