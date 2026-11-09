import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  money,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  StockPolicy,
  type SettingsInput,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Toggle } from '@/components/Toggle';
import { toast } from '@/lib/toast';
import { moneyText } from '@/lib/format';
import { settingsQuery, useUpdateSettings } from './api';

const EXPIRY_ALERT_DAYS_OPTIONS = [15, 30, 60];

const targetText = moneyText(money);

export function GeneralTab() {
  const { data: settings } = useQuery(settingsQuery());
  const update = useUpdateSettings();
  const [target, setTarget] = useState<string | null>(null);

  if (!settings) return null;

  const save = (patch: SettingsInput) =>
    update.mutate(patch, { onSuccess: () => toast('Configuração salva') });

  const targetValue = target ?? settings.revenueTargetMonthly?.toFixed(2).replace('.', ',') ?? '';

  const togglePaymentMethod = (method: PaymentMethod, on: boolean) => {
    const enabled = settings.enabledPaymentMethods;
    const next = on ? [...enabled, method] : enabled.filter((m) => m !== method);
    if (next.length === 0) {
      toast('Mantenha ao menos uma forma de pagamento', 'warn');
      return;
    }
    save({ enabledPaymentMethods: next });
  };

  const saveTarget = () => {
    const parsed = targetText.safeParse(targetValue);
    if (!parsed.success) {
      toast('Valor inválido', 'warn');
      return;
    }
    save({ revenueTargetMonthly: parsed.data });
  };

  return (
    <div className="grid grid-cols-2 gap-3 items-start">
      <Card>
        <div className="s-card-title">Venda sem estoque (BR-03 / FR-15)</div>
        <div className="s-dim text-[12.5px] mb-2.5">
          O que o PDV faz ao bipar um produto sem saldo disponível.
        </div>
        <div className="flex gap-2">
          <Chip
            active={settings.stockPolicy === StockPolicy.BLOCK}
            onClick={() => save({ stockPolicy: StockPolicy.BLOCK })}
          >
            Bloquear a venda
          </Chip>
          <Chip
            active={settings.stockPolicy === StockPolicy.WARN}
            onClick={() => save({ stockPolicy: StockPolicy.WARN })}
          >
            Apenas avisar
          </Chip>
        </div>
        <div className="s-divider" />
        <div className="s-card-title">Formas de pagamento habilitadas (FR-17)</div>
        <div className="flex flex-col gap-2">
          {Object.values(PaymentMethod).map((method) => (
            <Toggle
              key={method}
              on={settings.enabledPaymentMethods.includes(method)}
              label={PAYMENT_METHOD_LABELS[method]}
              onChange={(on) => togglePaymentMethod(method, on)}
            />
          ))}
        </div>
      </Card>
      <Card>
        <div className="s-card-title">Meta de receita mensal (FR-36 — opcional)</div>
        <div className="flex gap-2">
          <div className="s-input flex-1">
            <input
              value={targetValue}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="ex.: 50000,00"
            />
          </div>
          <Button primary onClick={saveTarget}>
            Salvar
          </Button>
        </div>
        <div className="s-divider" />
        <div className="s-card-title">Alerta de validade (FR-08)</div>
        <div className="s-dim text-[12.5px] mb-2">
          Avisar quando faltarem até N dias para o vencimento do lote.
        </div>
        <div className="flex gap-2">
          {EXPIRY_ALERT_DAYS_OPTIONS.map((days) => (
            <Chip
              key={days}
              active={settings.expiryAlertDays === days}
              onClick={() => save({ expiryAlertDays: days })}
            >
              {days} dias
            </Chip>
          ))}
        </div>
      </Card>
    </div>
  );
}
