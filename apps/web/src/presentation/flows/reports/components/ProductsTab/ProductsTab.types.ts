import type { ReactNode } from 'react';

export type ProductsTabProps = { from: string; to: string; margin: boolean };

export type ProductPerformanceRow = { key: string; cells: ReactNode[] };

export type ProductsTabViewProps = {
  rows: ProductPerformanceRow[];
};
