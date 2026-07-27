import type { ReactNode } from 'react';

export type DreLineProps = {
  op: string;
  label: string;
  value: ReactNode;
  strong?: boolean;
  accent?: boolean;
};
