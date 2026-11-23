import { DiscountType } from '@beverage/shared';
import { describe, expect, it } from 'vite-plus/test';
import { makeSale } from '@modules/sale/domain/fixtures';
import { discountLabel, parseScan } from './utils';

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

describe('discountLabel', () => {
  it('shows a dash without discount', () => {
    expect(discountLabel(null)).toBe('—');
    expect(discountLabel(makeSale())).toBe('—');
  });

  it('shows a percent or an amount in reais', () => {
    expect(discountLabel(makeSale({ discountType: DiscountType.PERCENT, discountValue: 10 }))).toBe(
      '10%',
    );
    expect(
      discountLabel(makeSale({ discountType: DiscountType.AMOUNT, discountValue: 5 })),
    ).toMatch(/^R\$\s5,00$/);
  });
});
