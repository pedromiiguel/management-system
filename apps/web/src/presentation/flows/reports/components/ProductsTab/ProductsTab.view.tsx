import { Card } from '@/presentation/components/Card';
import { Table } from '@/presentation/components/Table';
import type { ProductsTabViewProps } from './ProductsTab.types';

export function ProductsTabView({ rows }: ProductsTabViewProps) {
  return (
    <Card pad={8} className="flex-1 min-h-0 overflow-auto">
      <Table
        cols={['Produto', 'SKU', 'Qtd vendida', 'Receita', 'Custo', 'Margem', 'Margem %']}
        widths="1fr 100px 100px 110px 110px 110px 90px"
        align={[null, null, 'center', 'right', 'right', 'right', 'right']}
        dense
        emptyText="Sem vendas no período"
        rows={rows}
      />
    </Card>
  );
}
