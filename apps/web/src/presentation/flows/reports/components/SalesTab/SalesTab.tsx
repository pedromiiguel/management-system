import { PAYMENT_METHOD_LABELS } from '@beverage/shared';
import { Button } from '@/presentation/components/Button';
import { Tag } from '@/presentation/components/Tag';
import { formatBRL, formatDateTime } from '@/lib/format';
import { useSalesTabModel } from './SalesTab.model';
import { SalesTabView } from './SalesTab.view';
import type { SalesRow, SalesTabProps } from './SalesTab.types';

export function SalesTab({ from, to }: SalesTabProps) {
  const {
    report,
    sales,
    detail,
    onSelectDetail,
    onCloseDetail,
    voiding,
    onRequestVoid,
    onCancelVoid,
    onConfirmVoid,
    isVoiding,
  } = useSalesTabModel(from, to);

  const cancelled = sales.filter((s) => s.status === 'CANCELLED').length;
  const ticket = report && report.count > 0 ? Number(report.total) / report.count : 0;

  const rows: SalesRow[] = sales.map((s) => ({
    key: s.id,
    onClick: () => onSelectDetail(s),
    cells: [
      formatDateTime(s.completedAt ?? s.cancelledAt),
      `#${s.id.slice(-6).toUpperCase()}`,
      s.items.reduce((acc, i) => acc + i.quantity, 0),
      s.paymentMethod ? PAYMENT_METHOD_LABELS[s.paymentMethod] : '—',
      s.withInvoice ? 'sim' : 'não',
      <b key="t">{formatBRL(s.total)}</b>,
      s.status === 'CANCELLED' ? (
        <Tag key="a" tone="danger">cancelada</Tag>
      ) : (
        // span impede que o clique no Estornar também abra o detalhe
        <span key="a" onClick={(e) => e.stopPropagation()}>
          <Button ghost danger onClick={() => onRequestVoid(s)}>Estornar</Button>
        </span>
      ),
    ],
  }));

  return (
    <SalesTabView
      revenue={formatBRL(report?.total)}
      serviceFeeTotal={formatBRL(report?.serviceFeeTotal)}
      count={report?.count ?? 0}
      ticket={formatBRL(ticket)}
      cancelled={cancelled}
      dayValues={(report?.days ?? []).map((d) => Number(d.total))}
      dayLabels={(report?.days ?? []).map((d) => d.day.slice(8))}
      rows={rows}
      detail={detail}
      onCloseDetail={onCloseDetail}
      voiding={voiding}
      onCancelVoid={onCancelVoid}
      onConfirmVoid={onConfirmVoid}
      isVoiding={isVoiding}
    />
  );
}
