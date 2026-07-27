import { Button } from '@/presentation/components/Button';
import { formatBRL, formatDate } from '@/lib/format';
import { useReceivablesTabModel } from './ReceivablesTab.model';
import { ReceivablesTabView } from './ReceivablesTab.view';
import type { ReceivableRow } from './ReceivablesTab.types';

export function ReceivablesTab() {
  const { receivables, settling, setSettling, settle } = useReceivablesTabModel();

  const totalOpen = receivables.reduce((acc, r) => acc + Number(r.amount), 0);

  const rows: ReceivableRow[] = receivables.map((r) => ({
    key: r.id,
    cells: [
      r.customer.name,
      r.sale ? `#${r.sale.id.slice(-6).toUpperCase()}` : '—',
      formatDate(r.createdAt),
      r.dueDate ? formatDate(r.dueDate) : '—',
      <b key="v">{formatBRL(r.amount)}</b>,
      <Button key="b" ghost onClick={() => setSettling(r)}>Receber</Button>,
    ],
  }));

  return (
    <ReceivablesTabView
      totalOpen={totalOpen}
      rows={rows}
      settling={settling}
      onSettle={settle}
      onCloseSettle={() => setSettling(null)}
    />
  );
}
