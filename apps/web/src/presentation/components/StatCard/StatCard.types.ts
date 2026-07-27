import type { CSSProperties, ReactNode } from 'react';

export type StatCardProps = {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
  style?: CSSProperties;
};
