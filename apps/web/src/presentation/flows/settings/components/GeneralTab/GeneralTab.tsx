import { PaymentMethod, PAYMENT_METHOD_LABELS, StockPolicy } from '@beverage/shared';
import { useGeneralTabModel } from './GeneralTab.model';
import { GeneralTabView } from './GeneralTab.view';
import type { ExpiryAlertOption, PaymentMethodRow } from './GeneralTab.types';

const EXPIRY_ALERT_DAYS_OPTIONS = [15, 30, 60];

export function GeneralTab() {
  const {
    settings,
    target,
    setTarget,
    selectStockPolicy,
    togglePaymentMethod,
    saveTarget,
    selectExpiryAlertDays,
  } = useGeneralTabModel();

  if (!settings) return null;

  const targetValue = target ?? (settings.revenueTargetMonthly?.toFixed(2).replace('.', ',') || '');
  const paymentMethods: PaymentMethodRow[] = Object.values(PaymentMethod).map((method) => ({
    method,
    label: PAYMENT_METHOD_LABELS[method],
    on: settings.enabledPaymentMethods.includes(method),
  }));
  const expiryOptions: ExpiryAlertOption[] = EXPIRY_ALERT_DAYS_OPTIONS.map((days) => ({
    days,
    active: settings.expiryAlertDays === days,
  }));

  return (
    <GeneralTabView
      stockPolicyIsBlock={settings.stockPolicy === StockPolicy.BLOCK}
      stockPolicyIsWarn={settings.stockPolicy === StockPolicy.WARN}
      onSelectBlockPolicy={() => selectStockPolicy(StockPolicy.BLOCK)}
      onSelectWarnPolicy={() => selectStockPolicy(StockPolicy.WARN)}
      paymentMethods={paymentMethods}
      onTogglePaymentMethod={togglePaymentMethod}
      targetValue={targetValue}
      onChangeTarget={setTarget}
      onSaveTarget={saveTarget}
      expiryOptions={expiryOptions}
      onSelectExpiryAlertDays={selectExpiryAlertDays}
    />
  );
}
