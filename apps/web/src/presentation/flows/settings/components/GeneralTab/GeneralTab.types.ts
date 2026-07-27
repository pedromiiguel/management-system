import type { PaymentMethod } from '@beverage/shared';

export type PaymentMethodRow = {
  method: PaymentMethod;
  label: string;
  on: boolean;
};

export type ExpiryAlertOption = {
  days: number;
  active: boolean;
};

export type GeneralTabViewProps = {
  stockPolicyIsBlock: boolean;
  stockPolicyIsWarn: boolean;
  onSelectBlockPolicy: () => void;
  onSelectWarnPolicy: () => void;
  paymentMethods: PaymentMethodRow[];
  onTogglePaymentMethod: (method: PaymentMethod, on: boolean) => void;
  targetValue: string;
  onChangeTarget: (value: string) => void;
  onSaveTarget: () => void;
  expiryOptions: ExpiryAlertOption[];
  onSelectExpiryAlertDays: (days: number) => void;
};
