import type { ProgressBarProps } from './ProgressBar.types';

export function ProgressBarView({ pct, height = 10 }: ProgressBarProps) {
  return (
    <div className="s-progress" style={{ height }}>
      <div className="s-progress-fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}
