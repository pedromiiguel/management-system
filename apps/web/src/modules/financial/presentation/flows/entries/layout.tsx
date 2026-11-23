import { CashMovementType, PAYMENT_METHOD_LABELS } from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { PeriodPicker } from '@presentation/components/PeriodPicker';
import { StatCard } from '@presentation/components/StatCard';
import { Table } from '@presentation/components/Table';
import { formatBRL, formatDateTime } from '@presentation/utils/format';
import { ManualEntryFormFlow } from './manual-entry-form';
import type { TEntriesLayoutProps } from './types';

const OUTFLOW_CLASS = 'text-[color:var(--danger)]';

export function EntriesLayout({
  period,
  cashFlow,
  isCreating,
  onPeriodChange,
  onNewClick,
  onFormClose,
}: TEntriesLayoutProps) {
  return (
    <>
      <div className="flex gap-2.5 items-end">
        <PeriodPicker value={period} onChange={onPeriodChange} />
        <span className="flex-1" />
        <Button primary onClick={onNewClick}>
          + Lançamento avulso
        </Button>
      </div>
      <div className="flex gap-3">
        <StatCard label="Entradas" value={formatBRL(cashFlow?.inflows)} />
        <StatCard label="Saídas" value={formatBRL(cashFlow?.outflows)} />
        <StatCard label="Saldo do período" value={formatBRL(cashFlow?.balance)} accent />
      </div>
      <Card pad={8} className="flex-1 min-h-0 overflow-auto">
        <Table
          cols={['Data', 'Descrição', 'Categoria', 'Forma', 'Valor']}
          widths="110px 1fr 150px 90px 110px"
          align={[null, null, null, null, 'right']}
          dense
          emptyText="Nenhum movimento no período"
          rows={(cashFlow?.movements ?? []).map((movement) => ({
            key: movement.id,
            cells: [
              formatDateTime(movement.occurredAt),
              movement.description,
              movement.category?.name ?? '—',
              movement.paymentMethod ? PAYMENT_METHOD_LABELS[movement.paymentMethod] : '—',
              <b className={movement.type === CashMovementType.OUTFLOW ? OUTFLOW_CLASS : undefined}>
                {movement.type === CashMovementType.INFLOW ? '+' : '−'}
                {formatBRL(movement.amount)}
              </b>,
            ],
          }))}
        />
      </Card>
      {isCreating ? <ManualEntryFormFlow onClose={onFormClose} /> : null}
    </>
  );
}
