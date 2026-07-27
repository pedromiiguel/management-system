import type { ReactNode } from 'react';

export type StockPositionRowView = { key: string; cells: ReactNode[] };

export type StockTabViewProps = {
  itemCount: number;
  totalCost: string;
  totalValue: string;
  rows: StockPositionRowView[];
};
