import { SBtn, SCard, SChip, SToggle } from '@/components/sol';
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
      <SCard>
        <div className="s-card-title">Venda sem estoque (BR-03 / FR-15)</div>
        <div className="s-dim text-[12.5px] mb-2.5">
          O que o PDV faz ao bipar um produto sem saldo disponível.
        </div>
        <div className="flex gap-2">
          <SChip active={stockPolicyIsBlock} onClick={onSelectBlockPolicy}>
            Bloquear a venda
          </SChip>
          <SChip active={stockPolicyIsWarn} onClick={onSelectWarnPolicy}>
            Apenas avisar
          </SChip>
        </div>
        <div className="s-divider" />
        <div className="s-card-title">Formas de pagamento habilitadas (FR-17)</div>
        <div className="flex flex-col gap-2">
          {paymentMethods.map(({ method, label, on }) => (
            <SToggle key={method} on={on} label={label} onChange={(next) => onTogglePaymentMethod(method, next)} />
          ))}
        </div>
      </SCard>
      <SCard>
        <div className="s-card-title">Meta de faturamento mensal (FR-36 — opcional)</div>
        <div className="flex gap-2">
          <div className="s-input flex-1">
            <input
              value={targetValue}
              onChange={(e) => onChangeTarget(e.target.value)}
              placeholder="ex.: 50000,00"
            />
          </div>
          <SBtn primary onClick={onSaveTarget}>
            Salvar
          </SBtn>
        </div>
        <div className="s-divider" />
        <div className="s-card-title">Alerta de validade (FR-08)</div>
        <div className="s-dim text-[12.5px] mb-2">
          Avisar quando faltarem até N dias para o vencimento do lote.
        </div>
        <div className="flex gap-2">
          {expiryOptions.map(({ days, active }) => (
            <SChip key={days} active={active} onClick={() => onSelectExpiryAlertDays(days)}>
              {days} dias
            </SChip>
          ))}
        </div>
      </SCard>
    </div>
  );
}
