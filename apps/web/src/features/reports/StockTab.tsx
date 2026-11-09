import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { Table } from '@/components/Table';
import { formatBRL } from '@/lib/format';
import { stockPositionQuery } from './api';

export function StockTab() {
  const { data: rows = [] } = useQuery(stockPositionQuery());
  const totalCost = rows.reduce((acc, r) => acc + r.stockCost, 0);
  const totalValue = rows.reduce((acc, r) => acc + r.stockValue, 0);

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
          rows={rows.map((r) => ({
            key: r.id,
            cells: [
              r.sku,
              r.name,
              r.unit,
              r.minimumStock > 0 && r.currentStock <= r.minimumStock ? (
                <b key="s" className="s-low">
                  {r.currentStock}
                </b>
              ) : (
                r.currentStock
              ),
              r.minimumStock,
              formatBRL(r.stockCost),
              formatBRL(r.stockValue),
            ],
          }))}
        />
      </Card>
    </>
  );
}
