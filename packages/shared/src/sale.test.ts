import { describe, expect, it } from 'vitest';
import { DiscountType } from './enums';
import { priceSale, saleCode } from './sale';

const items = [
  { unitPrice: 3.5, quantity: 3 }, // 10,50
  { unitPrice: 10, quantity: 1 }, // 10,00
];

describe('priceSale', () => {
  it('soma o subtotal sem desconto nem taxa', () => {
    expect(priceSale({ items })).toEqual({
      subtotal: 20.5,
      discount: 0,
      serviceFee: null,
      total: 20.5,
      change: null,
    });
  });

  it('não acumula erro de float (0,1 × 3)', () => {
    expect(priceSale({ items: [{ unitPrice: 0.1, quantity: 3 }] }).total).toBe(0.3);
  });

  it('desconto em valor abate do subtotal', () => {
    const r = priceSale({ items, discount: { type: DiscountType.AMOUNT, value: 5 } });
    expect(r.discount).toBe(5);
    expect(r.total).toBe(15.5);
  });

  it('desconto em valor nunca deixa o total negativo', () => {
    const r = priceSale({ items, discount: { type: DiscountType.AMOUNT, value: 50 } });
    expect(r.discount).toBe(20.5);
    expect(r.total).toBe(0);
  });

  it('desconto percentual arredonda meio-para-cima no centavo', () => {
    // 20,50 × 0,85 = 17,425 → 17,43
    const r = priceSale({ items, discount: { type: DiscountType.PERCENT, value: 15 } });
    expect(r.total).toBe(17.43);
    expect(r.discount).toBe(3.07);
  });

  it('desconto percentual com casas decimais', () => {
    const r = priceSale({
      items: [{ unitPrice: 100, quantity: 1 }],
      discount: { type: DiscountType.PERCENT, value: 12.5 },
    });
    expect(r.total).toBe(87.5);
  });

  it('desconto de 100% zera o total', () => {
    const r = priceSale({ items, discount: { type: DiscountType.PERCENT, value: 100 } });
    expect(r.total).toBe(0);
  });

  it('taxa de serviço é 10% do subtotal pré-desconto, somada depois do desconto', () => {
    const r = priceSale({
      items,
      discount: { type: DiscountType.AMOUNT, value: 5 },
      serviceFee: true,
    });
    expect(r.serviceFee).toBe(2.05);
    expect(r.total).toBe(17.55);
  });

  it('taxa de serviço arredonda meio-para-cima', () => {
    // 3 × 1,15 = 3,45 → 10% = 0,345 → 0,35
    const r = priceSale({ items: [{ unitPrice: 1.15, quantity: 3 }], serviceFee: true });
    expect(r.serviceFee).toBe(0.35);
    expect(r.total).toBe(3.8);
  });

  it('troco é o valor recebido menos o total (com taxa)', () => {
    const r = priceSale({ items, serviceFee: true, amountPaid: 50 });
    expect(r.total).toBe(22.55);
    expect(r.change).toBe(27.45);
  });

  it('troco negativo sinaliza valor recebido insuficiente', () => {
    expect(priceSale({ items, amountPaid: 20 }).change).toBe(-0.5);
  });

  it('venda vazia vale zero', () => {
    expect(priceSale({ items: [], serviceFee: true }).total).toBe(0);
  });
});

describe('saleCode', () => {
  it('usa os 6 últimos caracteres do id em maiúsculas', () => {
    expect(saleCode('clx9abcdef123xyz')).toBe('123XYZ');
  });
});
