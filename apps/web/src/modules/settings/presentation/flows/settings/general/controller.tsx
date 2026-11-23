import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { PaymentMethod, SettingsInput, StockPolicy } from '@beverage/shared';
import { toast } from '@presentation/utils/toast';
import { toggleItem } from '@presentation/utils/toggle-item';
import { settingsQuery, useUpdateSettings } from '@modules/settings/main/settings-queries';
import { INVALID_TARGET_MESSAGE, LAST_PAYMENT_METHOD_MESSAGE, SAVED_MESSAGE } from './constants';
import { GeneralLayout } from './layout';
import { targetTextSchema } from './schema';
import { formatTargetInput } from './utils';

export function GeneralController() {
  const { data: settings } = useQuery(settingsQuery());
  const update = useUpdateSettings();
  const [targetState, setTargetState] = useState<string | null>(null);

  if (!settings) return null;

  const save = (patch: SettingsInput) =>
    update.mutate(patch, { onSuccess: () => toast(SAVED_MESSAGE) });

  const targetValue = targetState ?? formatTargetInput(settings.revenueTargetMonthly);

  const handlePaymentMethodToggle = (method: PaymentMethod, isOn: boolean) => {
    const next = toggleItem(settings.enabledPaymentMethods, method, isOn);
    if (next.length === 0) {
      toast(LAST_PAYMENT_METHOD_MESSAGE, 'warn');
      return;
    }
    save({ enabledPaymentMethods: next });
  };

  const handleSaveTargetClick = () => {
    const parsed = targetTextSchema.safeParse(targetValue);
    if (!parsed.success) {
      toast(INVALID_TARGET_MESSAGE, 'warn');
      return;
    }
    save({ revenueTargetMonthly: parsed.data });
  };

  return (
    <GeneralLayout
      settings={settings}
      targetValue={targetValue}
      onStockPolicyClick={(stockPolicy: StockPolicy) => save({ stockPolicy })}
      onPaymentMethodToggle={handlePaymentMethodToggle}
      onTargetChange={setTargetState}
      onSaveTargetClick={handleSaveTargetClick}
      onExpiryAlertDaysClick={(expiryAlertDays) => save({ expiryAlertDays })}
    />
  );
}
