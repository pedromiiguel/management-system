import { describe, expect, it } from 'vite-plus/test';
import { averageTicket, itemCount } from './utils';

describe('relatório de vendas', () => {
  it('calcula o ticket médio sem dividir por zero', () => {
    const report = { count: 4, revenue: 100, serviceFee: 10, days: [], voidedCount: 0 };
    expect(averageTicket(report)).toBe(25);
    expect(averageTicket({ ...report, count: 0 })).toBe(0);
    expect(averageTicket(undefined)).toBe(0);
  });

  it('soma as quantidades dos itens', () => {
    expect(itemCount([{ quantity: 2 }, { quantity: 3 }])).toBe(5);
  });
});
