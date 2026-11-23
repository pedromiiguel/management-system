import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Table } from '@presentation/components/Table';
import { Tag } from '@presentation/components/Tag';
import { formatBRL, formatDateOnly } from '@presentation/utils/format';
import { PayableFormFlow } from './payable-form';
import type { TPayablesLayoutProps } from './types';

export function PayablesLayout({
  rows,
  isCreating,
  onNewClick,
  onPayClick,
  onFormClose,
}: TPayablesLayoutProps) {
  return (
    <Card pad={8} className="flex-1 min-h-0 overflow-auto">
      <div className="flex justify-between px-2.5 pt-2 pb-1">
        <div className="s-card-title m-0">Contas em aberto</div>
        <Button primary onClick={onNewClick}>
          + Nova conta
        </Button>
      </div>
      <Table
        cols={['Descrição', 'Fornecedor', 'Categoria', 'Vencimento', 'Valor', '']}
        widths="1fr 140px 130px 110px 100px 100px"
        align={[null, null, null, null, 'right', 'right']}
        dense
        emptyText="Nenhuma conta em aberto ✓"
        rows={rows.map(({ payable, isOverdue }) => ({
          key: payable.id,
          cells: [
            payable.description,
            payable.supplier ?? '—',
            payable.category?.name ?? '—',
            isOverdue ? (
              <Tag tone="danger">{formatDateOnly(payable.dueDate)}</Tag>
            ) : (
              formatDateOnly(payable.dueDate)
            ),
            <b>{formatBRL(payable.amount)}</b>,
            <Button ghost onClick={() => onPayClick(payable)}>
              Pagar
            </Button>,
          ],
        }))}
      />
      {isCreating ? <PayableFormFlow onClose={onFormClose} /> : null}
    </Card>
  );
}
