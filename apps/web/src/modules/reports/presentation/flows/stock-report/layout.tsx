import { Card } from '@presentation/components/Card';
import { StatCard } from '@presentation/components/StatCard';
import { Table } from '@presentation/components/Table';
import { formatBRL } from '@presentation/utils/format';
import type { TStockReportLayoutProps } from './types';

export function StockReportLayout({ rows, totalCost, totalValue }: TStockReportLayoutProps) {
  return (
    <>
      <div className="flex gap-3">
        <StatCard label="Itens ativos" value={rows.length} />
        <StatCard label="Custo em estoque" value={formatBRL(totalCost)} />
        <StatCard label="Valor de venda do estoque" value={formatBRL(totalValue)} accent />
      </div>
      <Card pad={8} className="flex-1 min-h-0 overflow-auto">
        <Table
          cols={['SKU', 'Produto', 'Un.', 'Estoque', 'Mín.', 'Custo total', 'Valor de venda']}
          widths="90px 1fr 50px 80px 60px 120px 120px"
          align={[null, null, null, 'center', 'center', 'right', 'right']}
          dense
          rows={rows.map((row) => ({
            key: row.id,
            cells: [
              row.sku,
              row.name,
              row.unit,
              row.low ? (
                <b key="s" className="s-low">
                  {row.currentStock}
                </b>
              ) : (
                row.currentStock
              ),
              row.minimumStock,
              formatBRL(row.stockCost),
              formatBRL(row.stockValue),
            ],
          }))}
        />
      </Card>
    </>
  );
}
