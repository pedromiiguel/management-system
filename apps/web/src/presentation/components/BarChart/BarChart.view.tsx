import { clsx } from 'clsx';
import type { BarChartProps } from './BarChart.types';

export function BarChartView({ values, labels, height = 150, hl }: BarChartProps) {
  const max = Math.max(...values, 1);
  return (
    <div className="s-bars" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="s-bar-col">
          <div
            className={clsx('s-bar', i === hl && 'is-hl')}
            style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
            title={String(v)}
          />
          <div className="s-bar-label">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}
