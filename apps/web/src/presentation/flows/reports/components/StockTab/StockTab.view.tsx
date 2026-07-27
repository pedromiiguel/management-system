import { SCard, SStat, STable } from '@/components/sol';
import type { StockTabViewProps } from './StockTab.types';

export function StockTabView({ itemCount, totalCost, totalValue, rows }: StockTabViewProps) {
  return (
    <>
      <div className="flex gap-3">
        <SStat label="Itens ativos" value={itemCount} />
        <SStat label="Custo em estoque" value={totalCost} />
        <SStat label="Valor de venda do estoque" value={totalValue} accent />
      </div>
      <SCard pad={8} className="flex-1 min-h-0 overflow-auto">
        <STable
          cols={['SKU', 'Produto', 'Un.', 'Estoque', 'Mín.', 'Custo total', 'Valor de venda']}
          widths="90px 1fr 50px 80px 60px 120px 120px"
          align={[null, null, null, 'center', 'center', 'right', 'right']}
          dense
          rows={rows}
        />
      </SCard>
    </>
  );
}
