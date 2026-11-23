import { PAYMENT_METHOD_LABELS, saleCode } from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Modal } from '@presentation/components/Modal';
import { Table } from '@presentation/components/Table';
import { Tag } from '@presentation/components/Tag';
import { formatBRL, formatDate, formatDateOnly } from '@presentation/utils/format';
import { SETTLE_METHODS } from './constants';
import type { TReceivablesLayoutProps } from './types';

export function ReceivablesLayout({
  receivables,
  totalOpen,
  settling,
  onReceiveClick,
  onSettleMethodClick,
  onSettleClose,
}: TReceivablesLayoutProps) {
  return (
    <Card pad={8} className="flex-1 min-h-0 overflow-auto">
      <div className="flex justify-between px-2.5 pt-2 pb-1">
        <div className="s-card-title m-0">Fiado em aberto</div>
        <Tag tone="accent">total: {formatBRL(totalOpen)}</Tag>
      </div>
      <Table
        cols={['Cliente', 'Venda', 'Criado em', 'Vencimento', 'Valor', '']}
        widths="1fr 90px 110px 110px 100px 110px"
        align={[null, null, null, null, 'right', 'right']}
        dense
        emptyText="Nenhum fiado em aberto ✓"
        rows={receivables.map((receivable) => ({
          key: receivable.id,
          cells: [
            receivable.customer.name,
            receivable.sale ? `#${saleCode(receivable.sale.id)}` : '—',
            formatDate(receivable.createdAt),
            formatDateOnly(receivable.dueDate),
            <b key="v">{formatBRL(receivable.amount)}</b>,
            <Button key="b" ghost onClick={() => onReceiveClick(receivable)}>
              Receber
            </Button>,
          ],
        }))}
      />
      {settling ? (
        <Modal title={`Receber de ${settling.customer.name}`} onClose={onSettleClose} width={380}>
          <div className="s-kv">
            <span>Valor</span>
            <b>{formatBRL(settling.amount)}</b>
          </div>
          <div className="s-label mt-2.5">Forma de recebimento</div>
          <div className="flex gap-2">
            {SETTLE_METHODS.map((method) => (
              <Button key={method} ghost onClick={() => onSettleMethodClick(settling, method)}>
                {PAYMENT_METHOD_LABELS[method]}
              </Button>
            ))}
          </div>
        </Modal>
      ) : null}
    </Card>
  );
}
