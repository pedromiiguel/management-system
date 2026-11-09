import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  saleCode,
  type SettleReceivableInput,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { toast } from '@/components/Toast';
import { formatBRL, formatDate } from '@/lib/format';
import { receivablesQuery, useSettleReceivable, type Receivable } from './api';

const SETTLE_METHODS: SettleReceivableInput['paymentMethod'][] = [
  PaymentMethod.CASH,
  PaymentMethod.PIX,
  PaymentMethod.CARD,
];

export function ReceivablesTab() {
  const [settling, setSettling] = useState<Receivable | null>(null);
  const { data: receivables = [] } = useQuery(receivablesQuery());
  const settle = useSettleReceivable();
  const totalOpen = receivables.reduce((acc, r) => acc + r.amount, 0);

  function receive(receivable: Receivable, paymentMethod: SettleReceivableInput['paymentMethod']) {
    settle.mutate(
      { id: receivable.id, input: { paymentMethod } },
      {
        onSuccess: () => {
          toast('Recebimento registrado');
          setSettling(null);
        },
      },
    );
  }

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
        rows={receivables.map((r) => ({
          key: r.id,
          cells: [
            r.customer.name,
            r.sale ? `#${saleCode(r.sale.id)}` : '—',
            formatDate(r.createdAt),
            formatDate(r.dueDate),
            <b key="v">{formatBRL(r.amount)}</b>,
            <Button key="b" ghost onClick={() => setSettling(r)}>
              Receber
            </Button>,
          ],
        }))}
      />
      {settling ? (
        <Modal
          title={`Receber de ${settling.customer.name}`}
          onClose={() => setSettling(null)}
          width={380}
        >
          <div className="s-kv">
            <span>Valor</span>
            <b>{formatBRL(settling.amount)}</b>
          </div>
          <div className="s-label mt-2.5">Forma de recebimento</div>
          <div className="flex gap-2">
            {SETTLE_METHODS.map((method) => (
              <Button key={method} ghost onClick={() => receive(settling, method)}>
                {PAYMENT_METHOD_LABELS[method]}
              </Button>
            ))}
          </div>
        </Modal>
      ) : null}
    </Card>
  );
}
