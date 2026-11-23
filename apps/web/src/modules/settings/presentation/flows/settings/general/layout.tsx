import { PAYMENT_METHOD_LABELS, PaymentMethod, StockPolicy } from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Chip } from '@presentation/components/Chip';
import { Toggle } from '@presentation/components/Toggle';
import { EXPIRY_ALERT_DAYS_OPTIONS } from './constants';
import type { TGeneralLayoutProps } from './types';

const PAYMENT_METHODS = Object.values(PaymentMethod);

export function GeneralLayout({
  settings,
  targetValue,
  onStockPolicyClick,
  onPaymentMethodToggle,
  onTargetChange,
  onSaveTargetClick,
  onExpiryAlertDaysClick,
}: TGeneralLayoutProps) {
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
            onClick={() => onStockPolicyClick(StockPolicy.BLOCK)}
          >
            Bloquear a venda
          </Chip>
          <Chip
            active={settings.stockPolicy === StockPolicy.WARN}
            onClick={() => onStockPolicyClick(StockPolicy.WARN)}
          >
            Apenas avisar
          </Chip>
        </div>
        <div className="s-divider" />
        <div className="s-card-title">Formas de pagamento habilitadas (FR-17)</div>
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map((method) => (
            <Toggle
              key={method}
              on={settings.enabledPaymentMethods.includes(method)}
              label={PAYMENT_METHOD_LABELS[method]}
              onChange={(isOn) => onPaymentMethodToggle(method, isOn)}
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
              onChange={(event) => onTargetChange(event.target.value)}
              placeholder="ex.: 50000,00"
            />
          </div>
          <Button primary onClick={onSaveTargetClick}>
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
              onClick={() => onExpiryAlertDaysClick(days)}
            >
              {days} dias
            </Chip>
          ))}
        </div>
      </Card>
    </div>
  );
}
