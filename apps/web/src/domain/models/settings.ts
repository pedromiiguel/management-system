import type { PaymentMethod, StockPolicy } from '@beverage/shared';

export interface AppSettings {
  stockPolicy: StockPolicy;
  revenueTargetMonthly: number | null;
  enabledPaymentMethods: PaymentMethod[];
  defaultMinimumStock: number;
  expiryAlertDays: number;
}

export type { SettingsInput } from '@beverage/shared';
