import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Table } from '@/components/Table';
import { formatBRL } from '@/lib/format';
import { productPerformanceQuery } from './api';

export function ProductsTab({
  from,
  to,
  sortByMargin,
}: {
  from: string;
  to: string;
  sortByMargin?: boolean;
}) {
  const { data = [] } = useQuery(productPerformanceQuery(from, to));
  const rows = sortByMargin ? [...data].sort((a, b) => b.margin - a.margin) : data;

  return (
    <Card pad={8} className="flex-1 min-h-0 overflow-auto">
      <Table
        cols={['Produto', 'SKU', 'Qtd vendida', 'Receita', 'Custo', 'Margem', 'Margem %']}
        widths="1fr 100px 100px 110px 110px 110px 90px"
        align={[null, null, 'center', 'right', 'right', 'right', 'right']}
        dense
        emptyText="Sem vendas no período"
        rows={rows.map((r, i) => ({
          key: r.product?.id ?? String(i),
          cells: [
            r.product?.name ?? '—',
            r.product?.sku ?? '—',
            <b key="q">{r.quantity}</b>,
            formatBRL(r.revenue),
            formatBRL(r.cost),
            <b key="m">{formatBRL(r.margin)}</b>,
            `${r.marginPercent.toFixed(1)}%`,
          ],
        }))}
      />
    </Card>
  );
}
