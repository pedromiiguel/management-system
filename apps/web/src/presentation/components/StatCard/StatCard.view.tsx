import { clsx } from 'clsx';
import { Card } from '@/presentation/components/Card';
import type { StatCardProps } from './StatCard.types';

export function StatCardView({ label, value, sub, accent, style }: StatCardProps) {
  return (
    <Card style={{ flex: 1, ...style }}>
      <div className="s-stat-label">{label}</div>
      <div className={clsx('s-stat-value', accent && 'is-accent')}>{value}</div>
      {sub ? <div className="s-dim" style={{ fontSize: 12.5 }}>{sub}</div> : null}
    </Card>
  );
}
