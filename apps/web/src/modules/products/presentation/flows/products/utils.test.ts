import { describe, expect, it } from 'vite-plus/test';
import type { IProduct } from '../../../domain/product-model';
import { buildProductRows, countExpiringProducts } from './utils';

const product = (id: string, overrides: Partial<IProduct> = {}): IProduct => ({
  id,
  sku: id,
  ean: null,
  name: id,
  unit: 'un',
  purchasePrice: 1,
  salePrice: 2,
  currentStock: 10,
  minimumStock: 5,
  active: true,
  ...overrides,
});

const batch = (productId: string, expiresAt: string) => ({
  id: `${productId}-${expiresAt}`,
  batch: null,
  expiresAt,
  quantity: 1,
  product: { id: productId, name: productId, sku: productId },
});

const TODAY = '2026-11-23';
const ALERTS = {
  lowStock: [{ id: 'low', name: 'low', sku: 'low', currentStock: 1, minimumStock: 5 }],
  expiring: [batch('exp', '2026-11-26'), batch('exp', '2026-12-30'), batch('old', '2026-11-20')],
};
const PRODUCTS = [
  product('ok'),
  product('low'),
  product('exp'),
  product('old'),
  product('off', { active: false }),
];

describe('buildProductRows', () => {
  it('dá a situação de cada produto pelo primeiro lote a vencer', () => {
    const statuses = buildProductRows(PRODUCTS, ALERTS, 'all', TODAY).map((row) => [
      row.product.id,
      row.status.label,
    ]);
    expect(statuses).toEqual([
      ['ok', 'ativo'],
      ['low', 'estoque baixo'],
      ['exp', 'vence em 3d'],
      ['old', 'vencido'],
      ['off', 'inativo'],
    ]);
  });

  it.each([
    ['active', ['ok', 'low', 'exp', 'old']],
    ['low', ['low']],
    ['expiring', ['exp', 'old']],
  ] as const)('filtra %s', (filter, ids) => {
    expect(buildProductRows(PRODUCTS, ALERTS, filter, TODAY).map((row) => row.product.id)).toEqual(
      ids,
    );
  });

  it('conta produtos distintos vencendo', () => {
    expect(countExpiringProducts(ALERTS)).toBe(2);
  });
});
