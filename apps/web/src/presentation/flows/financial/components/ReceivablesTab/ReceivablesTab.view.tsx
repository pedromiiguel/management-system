import { PaymentMethod, PAYMENT_METHOD_LABELS } from '@beverage/shared';
import { Button } from '@/presentation/components/Button';
import { Card } from '@/presentation/components/Card';
import { Modal } from '@/presentation/components/Modal';
import { Table } from '@/presentation/components/Table';
import { Tag } from '@/presentation/components/Tag';
import { formatBRL } from '@/lib/format';
import type { ReceivablesTabViewProps } from './ReceivablesTab.types';

const SETTLE_METHODS = [PaymentMethod.CASH, PaymentMethod.PIX, PaymentMethod.CARD] as const;

export function ReceivablesTabView({
  totalOpen,
  rows,
  settling,
  onSettle,
  onCloseSettle,
}: ReceivablesTabViewProps) {
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
        rows={rows}
      />
      {settling ? (
        <Modal title={`Receber de ${settling.customer.name}`} onClose={onCloseSettle} width={380}>
          <div className="s-kv">
            <span>Valor</span>
            <b>{formatBRL(settling.amount)}</b>
          </div>
          <div className="s-label mt-2.5">Forma de recebimento</div>
          <div className="flex gap-2">
            {SETTLE_METHODS.map((m) => (
              <Button key={m} ghost onClick={() => onSettle(m)}>
                {PAYMENT_METHOD_LABELS[m]}
              </Button>
            ))}
          </div>
        </Modal>
      ) : null}
    </Card>
  );
}
