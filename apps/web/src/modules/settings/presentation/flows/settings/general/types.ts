import type { AppSettings, PaymentMethod, StockPolicy } from '@beverage/shared';

export type TGeneralLayoutProps = {
  settings: AppSettings;
  targetValue: string;
  onStockPolicyClick: (policy: StockPolicy) => void;
  onPaymentMethodToggle: (method: PaymentMethod, isOn: boolean) => void;
  onTargetChange: (value: string) => void;
  onSaveTargetClick: () => void;
  onExpiryAlertDaysClick: (days: number) => void;
};
