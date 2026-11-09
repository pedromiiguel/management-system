import { clsx } from 'clsx';
import type { PaymentMethod } from '@beverage/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Kbd } from '@/components/Kbd';
import { Toggle } from '@/components/Toggle';
import { formatBRL } from '@/lib/format';
import type { Customer } from './api';
import { PAYMENT_TILES, SALE_HOTKEYS } from './hotkeys';
import { SERVICE_FEE_LABEL } from './sale';

export function SaleTotalCard({
  total,
  itemCount,
  productCount,
}: {
  total: number;
  itemCount: number;
  productCount: number;
}) {
  return (
    <Card pad={18} className="text-center">
      <div className="s-stat-label">TOTAL DA VENDA</div>
      <div className="s-total" data-testid="sale-total">
        {formatBRL(total)}
      </div>
      <div className="s-dim text-[13px]">
        {itemCount} {itemCount === 1 ? 'item' : 'itens'} · {productCount}{' '}
        {productCount === 1 ? 'produto' : 'produtos'}
      </div>
    </Card>
  );
}

export function SaleChargesCard({
  discountLabel,
  serviceFee,
  fee,
  onToggleServiceFee,
  withInvoice,
  onToggleInvoice,
}: {
  discountLabel: string;
  serviceFee: boolean;
  fee: number;
  onToggleServiceFee: (on: boolean) => void;
  withInvoice: boolean;
  onToggleInvoice: (on: boolean) => void;
}) {
  return (
    <Card pad={12}>
      <div className="flex justify-between items-center">
        <span className="text-[13.5px]">Desconto</span>
        <span className="s-dim text-[13px]">
          <span data-testid="sale-discount-value">{discountLabel}</span>{' '}
          <Kbd>{SALE_HOTKEYS.discount.label}</Kbd>
        </span>
      </div>
      <div className="s-divider" />
      <div className="flex justify-between items-center">
        <span className="text-[13.5px]">Taxa de serviço ({SERVICE_FEE_LABEL})</span>
        <span className="flex items-center gap-2">
          {serviceFee ? (
            <span className="s-dim text-[13px]" data-testid="sale-service-fee-value">
              {formatBRL(fee)}
            </span>
          ) : null}
          <Toggle on={serviceFee} onChange={onToggleServiceFee} ariaLabel="Taxa de serviço" />
        </span>
      </div>
      <div className="s-divider" />
      <div className="flex justify-between items-center">
        <span className="text-[13.5px]">Emitir nota fiscal</span>
        <Toggle on={withInvoice} onChange={onToggleInvoice} ariaLabel="Emitir nota fiscal" />
      </div>
    </Card>
  );
}

export function PaymentTiles({
  payment,
  onSelect,
}: {
  payment: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PAYMENT_TILES.map(({ method, label, hotkey }) => (
        <button
          key={method}
          className={clsx('s-paytile', payment === method && 'is-active')}
          onClick={() => onSelect(method)}
          type="button"
          aria-label={`Pagamento ${label}`}
          aria-pressed={payment === method}
        >
          <b>{label}</b>
          <Kbd>{hotkey.label}</Kbd>
        </button>
      ))}
    </div>
  );
}

export function CashPanel({
  received,
  onReceivedChange,
  onEnter,
  change,
}: {
  received: string;
  onReceivedChange: (value: string) => void;
  onEnter: () => void;
  change: number | null;
}) {
  return (
    <Card pad={12}>
      <div className="s-kv">
        <span>Recebido</span>
        {/* inline: sobrescreve o padding do .s-input (classe DS unlayered vence o Tailwind) */}
        <span className="s-input" style={{ width: 120, padding: '4px 10px' }}>
          <input
            value={received}
            onChange={(event) => onReceivedChange(event.target.value)}
            inputMode="numeric"
            placeholder="0,00"
            aria-label="Valor recebido"
            style={{ textAlign: 'right', fontWeight: 700 }}
            onKeyDown={(event) => event.key === 'Enter' && onEnter()}
          />
        </span>
      </div>
      <div className="s-kv is-troco">
        <span>Troco</span>
        <b data-testid="sale-change">{change !== null && change >= 0 ? formatBRL(change) : '—'}</b>
      </div>
    </Card>
  );
}

export function CreditPanel({
  customer,
  onOpenCustomer,
}: {
  customer: Customer | null;
  onOpenCustomer: () => void;
}) {
  return (
    <Card pad={12}>
      <div className="s-kv">
        <span>Cliente</span>
        <b data-testid="sale-selected-customer">{customer?.name ?? '—'}</b>
      </div>
      <Button ghost style={{ width: '100%', marginTop: 6 }} onClick={onOpenCustomer}>
        {customer ? 'Trocar cliente' : 'Selecionar cliente'}
      </Button>
    </Card>
  );
}
