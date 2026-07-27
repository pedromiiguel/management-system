import { Card } from '@/presentation/components/Card';
import { StatCard } from '@/presentation/components/StatCard';
import { Table } from '@/presentation/components/Table';
import type { StockTabViewProps } from './StockTab.types';

export function StockTabView({ itemCount, totalCost, totalValue, rows }: StockTabViewProps) {
  return (
    <>
      <div className="flex gap-3">
        <StatCard label="Itens ativos" value={itemCount} />
        <StatCard label="Custo em estoque" value={totalCost} />
        <StatCard label="Valor de venda do estoque" value={totalValue} accent />
      </div>
      <Card pad={8} className="flex-1 min-h-0 overflow-auto">
        <Table
          cols={['SKU', 'Produto', 'Un.', 'Estoque', 'Mín.', 'Custo total', 'Valor de venda']}
          widths="90px 1fr 50px 80px 60px 120px 120px"
          align={[null, null, null, 'center', 'center', 'right', 'right']}
          dense
          rows={rows}
        />
      </Card>
    </>
  );
}
