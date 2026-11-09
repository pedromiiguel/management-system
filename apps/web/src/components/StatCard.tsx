import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import { Card } from './Card';

export function StatCard({
  label,
  value,
  sub,
  accent,
  style,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
  style?: CSSProperties;
}) {
  return (
    <Card style={{ flex: 1, ...style }}>
      <div className="s-stat-label">{label}</div>
      <div className={clsx('s-stat-value', accent && 'is-accent')}>{value}</div>
      {sub ? (
        <div className="s-dim" style={{ fontSize: 12.5 }}>
          {sub}
        </div>
      ) : null}
    </Card>
  );
}
