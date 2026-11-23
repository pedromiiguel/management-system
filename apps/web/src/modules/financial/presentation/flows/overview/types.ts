import type { PaymentMethod } from '@beverage/shared';
import type { IDashboard } from '../../../domain/financial-model';

export type TMethodShare = {
  paymentMethod: PaymentMethod;
  total: number;
  count: number;
  percent: number;
};

export type TTargetProgress = {
  target: number;
  revenue: number;
  percent: number;
  /** Quanto falta; null quando a meta já foi atingida. */
  missing: number | null;
};

export type TOverviewLayoutProps = {
  dashboard: IDashboard | undefined;
  grossMargin: number;
  methodShares: TMethodShare[];
  target: TTargetProgress | null;
};

export type TDreLineProps = {
  op: string;
  label: string;
  value: string;
  isStrong?: boolean;
  isResult?: boolean;
};
