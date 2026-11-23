import { DiscountType } from '@beverage/shared';
import { describe, expect, it } from 'vite-plus/test';
import { makeItem, makeSale } from './fixtures';
import { salePricing } from './sale-pricing';

const items = [
  makeItem({ id: 'a', quantity: 3, unitPrice: 9 }),
  makeItem({ id: 'b', quantity: 2, unitPrice: 5 }),
];

describe('salePricing', () => {
  it('reads discount and service fee from the sale as the server stores it', () => {
    const sale = makeSale({
      items,
      discountType: DiscountType.PERCENT,
      discountValue: 10,
      serviceFee: 3.7,
    });
    expect(salePricing(sale)).toEqual({
      subtotal: 37,
      discount: 3.7,
      serviceFee: 3.7,
      total: 37,
      change: null,
    });
  });

  it('treats a null serviceFee as "fee off" and an amount discount as reais', () => {
    const sale = makeSale({ items, discountType: DiscountType.AMOUNT, discountValue: 7 });
    expect(salePricing(sale)).toMatchObject({ discount: 7, serviceFee: null, total: 30 });
  });

  it('computes the change of a received amount against the amount due', () => {
    const sale = makeSale({ items, serviceFee: 3.7 });
    expect(salePricing(sale, 50).change).toBe(9.3);
    expect(salePricing(sale, 20).change).toBe(-20.7);
  });
});
