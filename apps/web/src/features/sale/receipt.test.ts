import { PaymentMethod } from '@beverage/shared';
import { describe, expect, it } from 'vitest';
import { makeItem, makeSale } from './fixtures';
import { buildCupom } from './receipt';

const sale = makeSale({
  subtotal: 54,
  total: 54.1,
  discountType: 'PERCENT',
  discountValue: 10,
  serviceFee: 5.5,
  paymentMethod: PaymentMethod.CASH,
  amountPaid: 60,
  change: 5.9,
  customer: { id: 'c-1', name: 'Fulano de Tal' },
  items: [
    makeItem({ id: 'a', quantity: 3, unitPrice: 12 }),
    makeItem({
      id: 'b',
      quantity: 2,
      unitPrice: 9,
      product: { name: 'Espeto de picanha', sku: 'ESP01', ean: null, unit: 'UN' },
    }),
  ],
});

const lines = buildCupom(sale).split('\n');

describe('buildCupom', () => {
  it('never exceeds the 40-column printer width', () => {
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(40);
  });

  it('prints the store header and the sale code', () => {
    expect(lines[0]!.trim()).toBe('COSTAS BAR');
    expect(lines[1]!.trim()).toBe('CNPJ 67.968.751/0001-77');
    expect(lines[2]).toContain('Venda #ABC123 - ');
  });

  it('prints each item in two lines, numbers aligned to the header columns', () => {
    const header = lines.find((l) => l.startsWith('#'))!;
    const first = lines.indexOf(header) + 2;
    expect(lines[first]).toBe('1  78960 Heineken 600ml');
    expect(lines[first + 1]!.length).toBe(40);
    expect(lines[first + 1]!.trimStart()).toMatch(/^3 +12,00 +36,00$/);
    expect(lines[first + 1]!.indexOf('12,00') + 5).toBe(header.indexOf('VL.UNIT') + 7);
    expect(lines[first + 1]!.endsWith('36,00')).toBe(true);
    expect(header.endsWith('VL.TOTAL')).toBe(true);
    expect(lines[first + 2]).toBe('2  ESP01 Espeto de picanha');
  });

  it('right-aligns totals with a plain space after R$', () => {
    const subtotal = lines.find((l) => l.startsWith('SUBTOTAL'))!;
    expect(subtotal).toHaveLength(40);
    expect(subtotal.endsWith('R$ 54,00')).toBe(true);
    expect(subtotal).not.toContain(' ');
  });

  it('shows discount with percentage, service fee and payment lines', () => {
    expect(lines).toContainEqual(expect.stringMatching(/^DESCONTO \(10%\) +-R\$ 5,40$/));
    expect(lines).toContainEqual(expect.stringMatching(/^TAXA DE SERVICO \(10%\) +R\$ 5,50$/));
    expect(lines).toContainEqual(expect.stringMatching(/^TOTAL GERAL +R\$ 54,10$/));
    expect(lines).toContain('PAGAMENTO: DINHEIRO');
    expect(lines).toContainEqual(expect.stringMatching(/^RECEBIDO +R\$ 60,00$/));
    expect(lines).toContainEqual(expect.stringMatching(/^TROCO +R\$ 5,90$/));
    expect(lines).toContainEqual(expect.stringMatching(/^CLIENTE +Fulano de Tal$/));
  });

  it('omits discount, fee and cash lines when absent', () => {
    const plain = buildCupom(
      makeSale({ subtotal: 10, total: 10, items: [makeItem()], paymentMethod: PaymentMethod.PIX }),
    );
    expect(plain).not.toContain('DESCONTO');
    expect(plain).not.toContain('TAXA DE SERVICO');
    expect(plain).not.toContain('TROCO');
    expect(plain).toContain('PAGAMENTO: PIX');
    expect(plain.split('\n').at(-1)!.trim()).toBe('Obrigado pela preferência!');
  });
});
