import type { ReactNode } from 'react';
import type { Sale } from '@/domain/models/sale';

export type SalesTabProps = { from: string; to: string };

export type SalesRow = { key: string; onClick: () => void; cells: ReactNode[] };

export type SalesTabViewProps = {
  revenue: string;
  serviceFeeTotal: string;
  count: number;
  ticket: string;
  cancelled: number;
  dayValues: number[];
  dayLabels: string[];
  rows: SalesRow[];
  detail: Sale | null;
  onCloseDetail: () => void;
  voiding: Sale | null;
  onCancelVoid: () => void;
  onConfirmVoid: () => void;
  isVoiding: boolean;
};
