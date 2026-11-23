import type { IDashboard } from '../../../domain/financial-model';
import { MONTH_LABELS } from './constants';
import type { TMethodShare, TTargetProgress } from './types';

/** `AAAA-MM` → "Nov". */
export const monthLabel = (month: string) => MONTH_LABELS[Number(month.slice(5, 7)) - 1] ?? month;

/** Margem bruta do demonstrativo: receita + taxa de serviço − CMV. */
export function grossMargin(result: IDashboard['result'] | undefined): number {
  return (result?.revenue ?? 0) + (result?.serviceFee ?? 0) - (result?.cogs ?? 0);
}

/** Participação de cada forma de pagamento no total cobrado do mês, em %. */
export function methodShares(byMethod: IDashboard['byMethodMonth']): TMethodShare[] {
  const total = byMethod.reduce((sum, method) => sum + method.total, 0);
  return byMethod.map((method) => ({
    ...method,
    percent: total > 0 ? (method.total / total) * 100 : 0,
  }));
}

/** Meta do mês; null quando não configurada. */
export function targetProgress(dashboard: IDashboard | undefined): TTargetProgress | null {
  const target = dashboard?.target.monthly;
  if (!target) return null;
  const revenue = dashboard.revenue.month;
  const progress = dashboard.target.progress;
  return {
    target,
    revenue,
    percent: progress ? Math.round(progress * 100) : 0,
    missing: revenue >= target ? null : target - revenue,
  };
}
