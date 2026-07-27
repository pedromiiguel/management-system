import { formatBRL } from '@/lib/format';
import { useProductsTabModel } from './ProductsTab.model';
import { ProductsTabView } from './ProductsTab.view';
import type { ProductPerformanceRow, ProductsTabProps } from './ProductsTab.types';

export function ProductsTab({ from, to, margin }: ProductsTabProps) {
  const { rows } = useProductsTabModel(from, to);
  const sorted = margin ? [...rows].sort((a, b) => Number(b.margin) - Number(a.margin)) : rows;

  const viewRows: ProductPerformanceRow[] = sorted.map((r, i) => ({
    key: r.product?.id ?? String(i),
    cells: [
      r.product?.name ?? '—',
      r.product?.sku ?? '—',
      <b key="q">{r.quantity}</b>,
      formatBRL(r.revenue),
      formatBRL(r.cost),
      <b key="m">{formatBRL(r.margin)}</b>,
      `${Number(r.marginPercent).toFixed(1)}%`,
    ],
  }));

  return <ProductsTabView rows={viewRows} />;
}
