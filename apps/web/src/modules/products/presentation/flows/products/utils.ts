import { dateOnlyKey, daysBetweenKeys } from '@beverage/shared';
import type { IProduct } from '../../../domain/product-model';
import type { TAlertsForRows, TProductFilter, TProductRow } from './types';

/** Primeiro lote a vencer de cada produto, como rótulo ("vence em 3d"). */
export function expiryLabels(alerts: TAlertsForRows, today: string): Map<string, string> {
  const labels = new Map<string, string>();
  for (const batch of alerts?.expiring ?? []) {
    if (batch.expiresAt && !labels.has(batch.product.id)) {
      const days = daysBetweenKeys(today, dateOnlyKey(batch.expiresAt));
      labels.set(batch.product.id, days <= 0 ? 'vencido' : `vence em ${days}d`);
    }
  }
  return labels;
}

/**
 * Linhas da tabela: filtro sobre a página atual (a API não filtra por alerta) e a
 * situação de cada produto — inativo, vencimento, estoque baixo ou ativo, nessa ordem.
 */
export function buildProductRows(
  products: IProduct[],
  alerts: TAlertsForRows,
  filter: TProductFilter,
  today: string,
): TProductRow[] {
  const lowIds = new Set(alerts?.lowStock.map((product) => product.id));
  const expiring = expiryLabels(alerts, today);

  const matches: Record<TProductFilter, (product: IProduct) => boolean> = {
    all: () => true,
    active: (product) => product.active,
    low: (product) => lowIds.has(product.id),
    expiring: (product) => expiring.has(product.id),
  };

  return products.filter(matches[filter]).map((product) => {
    const isLowStock = lowIds.has(product.id);
    const expiry = expiring.get(product.id);
    const status = !product.active
      ? { label: 'inativo', tone: 'dim' as const }
      : expiry
        ? { label: expiry, tone: 'warn' as const }
        : isLowStock
          ? { label: 'estoque baixo', tone: 'warn' as const }
          : { label: 'ativo', tone: 'ok' as const };
    return { product, isLowStock, status };
  });
}

/** Produtos distintos com lote vencendo (o contador do filtro). */
export function countExpiringProducts(alerts: TAlertsForRows): number {
  return new Set(alerts?.expiring.map((batch) => batch.product.id)).size;
}
