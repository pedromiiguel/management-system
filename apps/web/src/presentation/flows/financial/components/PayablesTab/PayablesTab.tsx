import { Button } from '@/presentation/components/Button';
import { Tag } from '@/presentation/components/Tag';
import { formatBRL, formatDate } from '@/lib/format';
import { usePayablesTabModel } from './PayablesTab.model';
import { PayablesTabView } from './PayablesTab.view';
import type { PayableRow } from './PayablesTab.types';

export function PayablesTab() {
  const { payables, creating, setCreating, pay, onCreated } = usePayablesTabModel();

  const rows: PayableRow[] = payables.map((p) => {
    const overdue = new Date(p.dueDate) < new Date();
    return {
      key: p.id,
      cells: [
        p.description,
        p.supplier ?? '—',
        p.category?.name ?? '—',
        overdue ? <Tag key="d" tone="danger">{formatDate(p.dueDate)}</Tag> : formatDate(p.dueDate),
        <b key="v">{formatBRL(p.amount)}</b>,
        <Button key="b" ghost onClick={() => pay(p.id)}>Pagar</Button>,
      ],
    };
  });

  return (
    <PayablesTabView
      rows={rows}
      creating={creating}
      onOpenCreate={() => setCreating(true)}
      onCloseCreate={() => setCreating(false)}
      onCreated={onCreated}
    />
  );
}
