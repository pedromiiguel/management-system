import { SaleStatus } from '@beverage/shared';
import type { Sale, SaleItem } from './api';

export function makeItem(overrides: Partial<SaleItem> = {}): SaleItem {
  return {
    id: 'item-1',
    productId: 'p-1',
    quantity: 1,
    unitPrice: 10,
    unitCost: 5,
    product: { name: 'Heineken 600ml', sku: 'HNK600', ean: '7896045504831', unit: 'UN' },
    ...overrides,
  };
}

export function makeSale(overrides: Partial<Sale> = {}): Sale {
  return {
    id: 'cm0000000000000000abc123',
    status: SaleStatus.COMPLETED,
    subtotal: 0,
    total: 0,
    discountType: null,
    discountValue: null,
    paymentMethod: null,
    amountPaid: null,
    change: null,
    serviceFee: null,
    withInvoice: true,
    openedAt: '2026-03-14T20:00:00.000Z',
    completedAt: '2026-03-14T20:05:00.000Z',
    cancelledAt: null,
    voidedAt: null,
    items: [],
    customer: null,
    operator: { id: 'u-1', name: 'Admin' },
    ...overrides,
  };
}
