import { Button } from '@/presentation/components/Button';
import { Card } from '@/presentation/components/Card';
import { Chip } from '@/presentation/components/Chip';
import { Toggle } from '@/presentation/components/Toggle';
import type { GeneralTabViewProps } from './GeneralTab.types';

export function GeneralTabView({
  stockPolicyIsBlock,
  stockPolicyIsWarn,
  onSelectBlockPolicy,
  onSelectWarnPolicy,
  paymentMethods,
  onTogglePaymentMethod,
  targetValue,
  onChangeTarget,
  onSaveTarget,
  expiryOptions,
  onSelectExpiryAlertDays,
}: GeneralTabViewProps) {
  return (
    <div className="grid grid-cols-2 gap-3 items-start">
      <Card>
        <div className="s-card-title">Venda sem estoque (BR-03 / FR-15)</div>
        <div className="s-dim text-[12.5px] mb-2.5">
          O que o PDV faz ao bipar um produto sem saldo disponível.
        </div>
        <div className="flex gap-2">
          <Chip active={stockPolicyIsBlock} onClick={onSelectBlockPolicy}>
            Bloquear a venda
          </Chip>
          <Chip active={stockPolicyIsWarn} onClick={onSelectWarnPolicy}>
            Apenas avisar
          </Chip>
        </div>
        <div className="s-divider" />
        <div className="s-card-title">Formas de pagamento habilitadas (FR-17)</div>
        <div className="flex flex-col gap-2">
          {paymentMethods.map(({ method, label, on }) => (
            <Toggle key={method} on={on} label={label} onChange={(next) => onTogglePaymentMethod(method, next)} />
          ))}
        </div>
      </Card>
      <Card>
        <div className="s-card-title">Meta de faturamento mensal (FR-36 — opcional)</div>
        <div className="flex gap-2">
          <div className="s-input flex-1">
            <input
              value={targetValue}
              onChange={(e) => onChangeTarget(e.target.value)}
              placeholder="ex.: 50000,00"
            />
          </div>
          <Button primary onClick={onSaveTarget}>
            Salvar
          </Button>
        </div>
        <div className="s-divider" />
        <div className="s-card-title">Alerta de validade (FR-08)</div>
        <div className="s-dim text-[12.5px] mb-2">
          Avisar quando faltarem até N dias para o vencimento do lote.
        </div>
        <div className="flex gap-2">
          {expiryOptions.map(({ days, active }) => (
            <Chip key={days} active={active} onClick={() => onSelectExpiryAlertDays(days)}>
              {days} dias
            </Chip>
          ))}
        </div>
      </Card>
    </div>
  );
}
