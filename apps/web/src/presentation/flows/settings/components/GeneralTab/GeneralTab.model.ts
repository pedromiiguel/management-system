import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PaymentMethod, StockPolicy, type SettingsInput } from '@beverage/shared';
import { useToast } from '@/components/sol';
import { apiErrorMessage } from '@/lib/api';
import { parseMoney } from '@/lib/format';
import { useUpdateSettingsMutation } from '@/main/factories/mutations/settings';
import { useSettingsQuery } from '@/main/factories/queries/settings';

export function useGeneralTabModel() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: settings } = useSettingsQuery();
  const [target, setTarget] = useState<string | null>(null);
  const update = useUpdateSettingsMutation();

  const save = (patch: SettingsInput) => {
    update.mutate(patch, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['settings'] });
        void queryClient.invalidateQueries({ queryKey: ['financial'] });
        toast('Configuração salva');
      },
      onError: (error) => toast(apiErrorMessage(error), 'danger'),
    });
  };

  const selectStockPolicy = (stockPolicy: StockPolicy) => save({ stockPolicy });

  const togglePaymentMethod = (method: PaymentMethod, on: boolean) => {
    if (!settings) return;
    const next = on
      ? [...settings.enabledPaymentMethods, method]
      : settings.enabledPaymentMethods.filter((m) => m !== method);
    if (next.length === 0) {
      toast('Mantenha ao menos uma forma de pagamento', 'warn');
      return;
    }
    save({ enabledPaymentMethods: next });
  };

  const saveTarget = () => {
    const value = parseMoney(target ?? '');
    if (!Number.isFinite(value)) {
      toast('Valor inválido', 'warn');
      return;
    }
    save({ revenueTargetMonthly: value });
  };

  const selectExpiryAlertDays = (expiryAlertDays: number) => save({ expiryAlertDays });

  return {
    settings,
    target,
    setTarget,
    selectStockPolicy,
    togglePaymentMethod,
    saveTarget,
    selectExpiryAlertDays,
  };
}
