import { formatBRL } from '@/lib/format';
import { useStockTabModel } from './StockTab.model';
import { StockTabView } from './StockTab.view';
import type { StockPositionRowView } from './StockTab.types';

export function StockTab() {
  const { rows } = useStockTabModel();
  const totalCost = rows.reduce((acc, r) => acc + Number(r.stockCost), 0);
  const totalValue = rows.reduce((acc, r) => acc + Number(r.stockValue), 0);

  const viewRows: StockPositionRowView[] = rows.map((r) => ({
    key: r.id,
    cells: [
      r.sku,
      r.name,
      r.unit,
      r.minimumStock > 0 && r.currentStock <= r.minimumStock ? (
        <b key="s" className="s-low">{r.currentStock}</b>
      ) : (
        r.currentStock
      ),
      r.minimumStock,
      formatBRL(r.stockCost),
      formatBRL(r.stockValue),
    ],
  }));

  return (
    <StockTabView
      itemCount={rows.length}
      totalCost={formatBRL(totalCost)}
      totalValue={formatBRL(totalValue)}
      rows={viewRows}
    />
  );
}
