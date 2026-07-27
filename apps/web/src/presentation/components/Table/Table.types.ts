import type { CSSProperties, ReactNode } from 'react';

export type TableProps = {
  cols: ReactNode[];
  widths: string;
  rows: {
    key: string;
    cells: ReactNode[];
    highlight?: boolean;
    onClick?: () => void;
    testId?: string;
  }[];
  align?: (CSSProperties['textAlign'] | null)[];
  dense?: boolean;
  emptyText?: string;
};
