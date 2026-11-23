import { Card } from '@presentation/components/Card';
import { Table } from '@presentation/components/Table';
import { formatBRL } from '@presentation/utils/format';
import type { TProductsReportLayoutProps } from './types';

export function ProductsReportLayout({ rows }: TProductsReportLayoutProps) {
  return (
    <Card pad={8} className="flex-1 min-h-0 overflow-auto">
      <Table
        cols={['Produto', 'SKU', 'Qtd vendida', 'Valor bruto', 'Custo', 'Margem', 'Margem %']}
        widths="1fr 100px 100px 110px 110px 110px 90px"
        align={[null, null, 'center', 'right', 'right', 'right', 'right']}
        dense
        emptyText="Sem vendas no período"
        rows={rows.map((row, index) => ({
          key: row.product?.id ?? String(index),
          cells: [
            row.product?.name ?? '—',
            row.product?.sku ?? '—',
            <b key="q">{row.quantity}</b>,
            formatBRL(row.grossSales),
            formatBRL(row.cost),
            <b key="m">{formatBRL(row.margin)}</b>,
            `${row.marginPercent.toFixed(1)}%`,
          ],
        }))}
      />
    </Card>
  );
}
