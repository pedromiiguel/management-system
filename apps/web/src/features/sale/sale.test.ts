import { PaymentMethod } from '@beverage/shared';
import { describe, expect, it } from 'vitest';
import { makeItem, makeSale } from './fixtures';
import { discountAmount, parseScan, previewCheckout, saleCode, SERVICE_FEE_LABEL } from './sale';

const twoItems = makeSale({
  subtotal: 37,
  total: 37,
  items: [
    makeItem({ id: 'a', quantity: 3, unitPrice: 9 }),
    makeItem({ id: 'b', quantity: 2, unitPrice: 5 }),
  ],
});

describe('previewCheckout', () => {
  it('sums items and counts units and products', () => {
    const preview = previewCheckout(twoItems, {
      serviceFee: false,
      payment: PaymentMethod.PIX,
      received: NaN,
    });
    expect(preview).toEqual({ fee: 0, total: 37, change: null, itemCount: 5, productCount: 2 });
  });

  it('adds the service fee over the item subtotal, rounded to cents', () => {
    const sale = makeSale({
      subtotal: 33.33,
      total: 33.33,
      items: [makeItem({ quantity: 1, unitPrice: 33.33 })],
    });
    const preview = previewCheckout(sale, {
      serviceFee: true,
      payment: PaymentMethod.CARD,
      received: 0,
    });
    expect(preview.fee).toBe(3.33);
    expect(preview.total).toBeCloseTo(36.66, 2);
  });

  it('keeps the discount from the server total and charges the fee on the gross subtotal', () => {
    const discounted = { ...twoItems, total: 30 };
    const preview = previewCheckout(discounted, {
      serviceFee: true,
      payment: PaymentMethod.CARD,
      received: 0,
    });
    expect(preview.fee).toBe(3.7);
    expect(preview.total).toBeCloseTo(33.7, 2);
  });

  it('computes change only for cash', () => {
    const cash = previewCheckout(twoItems, {
      serviceFee: false,
      payment: PaymentMethod.CASH,
      received: 50,
    });
    expect(cash.change).toBe(13);
    const short = previewCheckout(twoItems, {
      serviceFee: false,
      payment: PaymentMethod.CASH,
      received: 20,
    });
    expect(short.change).toBe(-17);
    const invalid = previewCheckout(twoItems, {
      serviceFee: false,
      payment: PaymentMethod.CASH,
      received: NaN,
    });
    expect(invalid.change).toBeNull();
  });

  it('handles no sale yet', () => {
    expect(
      previewCheckout(null, { serviceFee: true, payment: PaymentMethod.CASH, received: 0 }),
    ).toEqual({ fee: 0, total: 0, change: 0, itemCount: 0, productCount: 0 });
  });
});

describe('parseScan', () => {
  it('reads a plain code', () => {
    expect(parseScan(' 7891234 ')).toEqual({ code: '7891234' });
  });

  it.each(['3*7891234', '3x7891234', '3X 7891234'])('reads the quantity prefix in %j', (raw) => {
    expect(parseScan(raw)).toEqual({ code: '7891234', quantity: 3 });
  });

  it('ignores blank input', () => {
    expect(parseScan('   ')).toBeNull();
  });
});

describe('sale helpers', () => {
  it('saleCode is the last 6 chars upper-cased', () => {
    expect(saleCode('cm0000000000000000abc123')).toBe('ABC123');
  });

  it('discountAmount is what the subtotal lost, ignoring the service fee', () => {
    expect(discountAmount({ subtotal: 100, total: 99, serviceFee: 9 })).toBe(10);
    expect(discountAmount({ subtotal: 50, total: 50, serviceFee: null })).toBe(0);
  });

  it('SERVICE_FEE_LABEL comes from the shared rate', () => {
    expect(SERVICE_FEE_LABEL).toBe('10%');
  });
});
