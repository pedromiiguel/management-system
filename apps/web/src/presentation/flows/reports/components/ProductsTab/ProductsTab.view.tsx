import { SCard, STable } from '@/components/sol';
import type { ProductsTabViewProps } from './ProductsTab.types';

export function ProductsTabView({ rows }: ProductsTabViewProps) {
  return (
    <SCard pad={8} className="flex-1 min-h-0 overflow-auto">
      <STable
        cols={['Produto', 'SKU', 'Qtd vendida', 'Receita', 'Custo', 'Margem', 'Margem %']}
        widths="1fr 100px 100px 110px 110px 110px 90px"
        align={[null, null, 'center', 'right', 'right', 'right', 'right']}
        dense
        emptyText="Sem vendas no período"
        rows={rows}
      />
    </SCard>
  );
}
