import { describe, expect, it } from 'vite-plus/test';
import { PaymentMethod } from '@beverage/shared';
import type { IDashboard } from '../../../domain/financial-model';
import { grossMargin, methodShares, monthLabel, targetProgress } from './utils';

const dashboard = (target: number | null, progress: number | null, month = 800): IDashboard => ({
  revenue: { day: 0, month, year: 0 },
  serviceFee: { day: 0, month: 0, year: 0 },
  byMethodMonth: [],
  monthly: [],
  result: { revenue: 800, serviceFee: 80, cogs: 300, expenses: 100, profit: 480 },
  target: { monthly: target, progress },
});

describe('overview', () => {
  it('rotula o mês', () => {
    expect(monthLabel('2026-11')).toBe('Nov');
  });

  it('calcula a margem bruta com a taxa de serviço', () => {
    expect(grossMargin(dashboard(null, null).result)).toBe(580);
  });

  it('divide o total por forma de pagamento', () => {
    const shares = methodShares([
      { paymentMethod: PaymentMethod.PIX, total: 75, count: 1 },
      { paymentMethod: PaymentMethod.CASH, total: 25, count: 1 },
    ]);
    expect(shares.map((share) => share.percent)).toEqual([75, 25]);
    expect(methodShares([])).toEqual([]);
  });

  it('mostra a meta só quando configurada', () => {
    expect(targetProgress(dashboard(null, null))).toBeNull();
    expect(targetProgress(dashboard(1000, 0.8))).toEqual({
      target: 1000,
      revenue: 800,
      percent: 80,
      missing: 200,
    });
    expect(targetProgress(dashboard(500, 1.6))?.missing).toBeNull();
  });
});
