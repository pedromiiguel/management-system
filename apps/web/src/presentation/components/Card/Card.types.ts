import type { CSSProperties, ReactNode } from 'react';

export type CardProps = {
  children: ReactNode;
  pad?: number;
  style?: CSSProperties;
  className?: string;
};
